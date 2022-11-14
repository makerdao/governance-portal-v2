import { NextApiRequest, NextApiResponse } from 'next';
import withApiHandler from 'modules/app/api/withApiHandler';
import { ethers } from 'ethers';
import { getTypedBallotData } from 'modules/web3/helpers/signTypedBallotData';
import { cacheSet } from 'modules/cache/cache';
import { GASLESS_RATE_LIMIT_IN_MS } from 'modules/polling/polling.constants';
import { getRecentlyUsedGaslessVotingKey } from 'modules/cache/constants/cache-keys';
import { config } from 'lib/config';
import { getArbitrumPollingContractRelayProvider } from 'modules/polling/api/getArbitrumPollingContractRelayProvider';
import logger from 'lib/logger';
import { getPolls } from 'modules/polling/api/fetchPolls';
import { isActivePoll } from 'modules/polling/helpers/utils';
import { recentlyUsedGaslessVotingCheck } from 'modules/polling/helpers/recentlyUsedGaslessVotingCheck';
import { hasMkrRequiredVotingWeight } from 'modules/polling/helpers/hasMkrRequiredVotingWeight';
import { MIN_MKR_REQUIRED_FOR_GASLESS_VOTING } from 'modules/polling/polling.constants';
import { postRequestToDiscord } from 'modules/app/api/postRequestToDiscord';
import { isSupportedNetwork } from 'modules/web3/helpers/networks';
import { ballotIncludesAlreadyVoted } from 'modules/polling/helpers/ballotIncludesAlreadyVoted';
import { getVoteProxyAddresses } from 'modules/app/helpers/getVoteProxyAddresses';
import { getDelegateContractAddress } from 'modules/delegates/helpers/getDelegateContractAddress';
import { networkNameToChainId } from 'modules/web3/helpers/chain';
import { getContracts } from 'modules/web3/helpers/getContracts';

export const API_VOTE_ERRORS = {
  VOTER_MUST_BE_STRING: 'Voter must be a string.',
  POLLIDS_MUST_BE_ARRAY_NUMBERS: 'PollIds must be an array of numbers.',
  OPTIONIDS_MUST_BE_ARRAY_NUMBERS: 'OptionIds must be an array of numbers.',
  NONCE_MUST_BE_NUMBER: 'Nonce must be a number.',
  EXPIRY_MUST_BE_NUMBER: 'Expiry must be a number.',
  SIGNATURE_MUST_BE_STRING: 'Signature must be a string.',
  INVALID_NETWORK: 'Invalid network.',
  WRONG_SECRET: 'Wrong secret.',
  INVALID_NONCE_FOR_ADDRESS: 'Invalid nonce for address.',
  EXPIRED_VOTES: 'Expiration date already passed.',
  EXPIRED_POLLS: 'Can only vote in active polls.',
  RATE_LIMITED: 'Address cannot use gasless service more than once per 10 minutes.',
  VOTER_AND_SIGNER_DIFFER: 'Voter address could not be recovered from signature.',
  LESS_THAN_MINIMUM_MKR_REQUIRED: `Address must have a poll voting weight of at least ${MIN_MKR_REQUIRED_FOR_GASLESS_VOTING.toString()}.`,
  ALREADY_VOTED_IN_POLL: 'Address has already voted in this poll.',
  RELAYER_ERROR: 'Relayer transaction creation failed.'
};

import { ApiError } from 'modules/app/api/ApiError';
import { verifyTypedSignature } from 'modules/web3/helpers/verifyTypedSignature';

async function postErrorInDiscord(error: string, body: any, type = 'error') {
  // Post on discord
  try {
    if (config.GASLESS_WEBHOOK_URL) {
      await postRequestToDiscord({
        url: config.GASLESS_WEBHOOK_URL,
        content: JSON.stringify({
          [type]: error,
          ...body
        }),
        // TODO turn this to true when ready to deploy
        notify: false
      });
    }
  } catch (err) {
    logger.error('API Vote: Unable to post error to discord', err.message);
  }
}

type ErrorArgs = { error: string; body: any; code?: number; skipDiscord?: boolean };

async function throwError({ error, body, code = 400, skipDiscord = false }: ErrorArgs) {
  // Post on discord
  if (!skipDiscord) postErrorInDiscord(error, body);

  // Return api error
  throw new ApiError(`Poll Gasless Vote: ${error}`, code, error);
}

//TODO: add swagger documentation
export default withApiHandler(
  async (req: NextApiRequest, res: NextApiResponse) => {
    const { voter, pollIds, optionIds, nonce, expiry, signature, network, secret, skipDiscord } = req.body;
    if (typeof voter !== 'string' || !voter) {
      await throwError({ error: API_VOTE_ERRORS.VOTER_MUST_BE_STRING, body: req.body, skipDiscord });
    }
    if (!Array.isArray(pollIds) || !pollIds.every(e => !isNaN(parseInt(e)))) {
      await throwError({
        error: API_VOTE_ERRORS.POLLIDS_MUST_BE_ARRAY_NUMBERS,
        body: req.body,
        skipDiscord
      });
    }
    if (!Array.isArray(optionIds) || !optionIds.every(e => !isNaN(parseInt(e)))) {
      await throwError({
        error: API_VOTE_ERRORS.OPTIONIDS_MUST_BE_ARRAY_NUMBERS,
        body: req.body,
        skipDiscord
      });
    }
    if (typeof nonce !== 'number') {
      await throwError({ error: API_VOTE_ERRORS.NONCE_MUST_BE_NUMBER, body: req.body, skipDiscord });
    }
    if (typeof expiry !== 'number') {
      await throwError({ error: API_VOTE_ERRORS.EXPIRY_MUST_BE_NUMBER, body: req.body, skipDiscord });
    }

    if (expiry <= Date.now() / 1000) {
      await throwError({ error: API_VOTE_ERRORS.EXPIRED_VOTES, body: req.body, skipDiscord });
    }

    if (typeof signature !== 'string' || !signature) {
      await throwError({ error: API_VOTE_ERRORS.SIGNATURE_MUST_BE_STRING, body: req.body, skipDiscord });
    }

    if (!isSupportedNetwork(network)) {
      await throwError({ error: API_VOTE_ERRORS.INVALID_NETWORK, body: req.body, skipDiscord });
    }

    if (secret && secret !== config.GASLESS_BACKDOOR_SECRET) {
      await throwError({ error: API_VOTE_ERRORS.WRONG_SECRET, body: req.body, skipDiscord });
    }

    //get arbitrum polling contract with relayer's signer
    const pollingContract = await getArbitrumPollingContractRelayProvider(network);

    // Extract the real address that will be used for voting (delegate contract, proxy contract or normal address)
    const contracts = getContracts(networkNameToChainId(network), undefined, undefined, true);

    // Find the voty proxy for the address (in case there's one)
    const voteProxyAddress = await getVoteProxyAddresses(contracts.voteProxyFactory, voter, network);

    // Find the delegate contract address if the address is a normal wallet
    const voteDelegateAdress = await getDelegateContractAddress(contracts, voter);

    const addressDisplayedAsVoter = voteDelegateAdress
      ? voteDelegateAdress
      : voteProxyAddress?.hotAddress
      ? voteProxyAddress.hotAddress
      : voter;

    //verify valid nonce and expiry date
    const nonceFromContract = await pollingContract.nonces(voter);
    if (nonceFromContract.toNumber() !== nonce) {
      await throwError({ error: API_VOTE_ERRORS.INVALID_NONCE_FOR_ADDRESS, body: req.body, skipDiscord });
    }

    //verify that signature and address correspond
    const typedData = getTypedBallotData({ voter, pollIds, optionIds, nonce, expiry }, network);
    const recovered = verifyTypedSignature(typedData.domain, typedData.types, typedData.message, signature);

    if (ethers.utils.getAddress(recovered) !== ethers.utils.getAddress(voter)) {
      await throwError({ error: API_VOTE_ERRORS.VOTER_AND_SIGNER_DIFFER, body: req.body, skipDiscord });
    }

    //run eligibility checks unless backdoor secret provided
    if (!secret || secret !== config.GASLESS_BACKDOOR_SECRET) {
      //verify address has a poll weight > 0.1 MKR
      const hasMkrRequired = await hasMkrRequiredVotingWeight(
        voter,
        network,
        MIN_MKR_REQUIRED_FOR_GASLESS_VOTING,
        true
      );

      if (!hasMkrRequired) {
        //ether's bignumber library doesnt handle decimals
        await throwError({
          error: API_VOTE_ERRORS.LESS_THAN_MINIMUM_MKR_REQUIRED,
          body: req.body,
          skipDiscord
        });
      }

      // Verify that all the polls are active
      const filters = {
        startDate: new Date(),
        endDate: null,
        tags: null
      };

      const pollsResponse = await getPolls(filters, network);
      const areAllPollsActive = pollIds
        .map(pollId => {
          const poll = pollsResponse.polls.find(p => p.pollId === parseInt(pollId));
          if (!poll || !isActivePoll(poll)) {
            return false;
          }
          return true;
        })
        .reduce((prev, next) => {
          return prev && next;
        });

      if (!areAllPollsActive) {
        await throwError({ error: API_VOTE_ERRORS.EXPIRED_POLLS, body: req.body, skipDiscord });
      }

      //check that address hasn't used gasless service recently
      // use the "addressDisplayedAsVoter" in case the user created a delegate contract, so it does not use the user's wallet
      const recentlyUsedGaslessVoting = await recentlyUsedGaslessVotingCheck(
        addressDisplayedAsVoter,
        network
      );
      if (recentlyUsedGaslessVoting) {
        await throwError({ error: API_VOTE_ERRORS.RATE_LIMITED, body: req.body, skipDiscord });
      }
      //can't use gasless service to vote in a poll you've already voted on
      // use "addressDisplayedAsVoter" to make sure we match against the delegate contract votes or the normal votes.
      const ballotHasVotedPolls = await ballotIncludesAlreadyVoted(addressDisplayedAsVoter, network, pollIds);
      if (ballotHasVotedPolls) {
        await throwError({ error: API_VOTE_ERRORS.ALREADY_VOTED_IN_POLL, body: req.body, skipDiscord });
      }
    } else {
      await postErrorInDiscord('bypassing eligibilty requirements', req.body, 'notice');
    }
    const { r, s, v } = ethers.utils.splitSignature(signature);

    const cacheKey = getRecentlyUsedGaslessVotingKey(addressDisplayedAsVoter);
    cacheSet(cacheKey, JSON.stringify(Date.now()), network, GASLESS_RATE_LIMIT_IN_MS);
    let tx;
    try {
      tx = await pollingContract['vote(address,uint256,uint256,uint256[],uint256[],uint8,bytes32,bytes32)'](
        voter,
        nonce,
        expiry,
        pollIds,
        optionIds,
        v,
        r,
        s
      );
    } catch (err) {
      //don't rate limit if tx didn't succeed
      cacheSet(cacheKey, '', network, GASLESS_RATE_LIMIT_IN_MS);
      await throwError({ error: API_VOTE_ERRORS.RELAYER_ERROR, body: req.body, skipDiscord });
    }

    return res.status(200).json(tx);
  },
  { allowPost: true }
);
