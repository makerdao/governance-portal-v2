import { NextApiRequest, NextApiResponse } from 'next';
import withApiHandler from 'modules/app/api/withApiHandler';
import { ethers } from 'ethers';
import { recoverTypedSignature, SignTypedDataVersion } from '@metamask/eth-sig-util';
import { getTypedBallotData } from 'modules/web3/helpers/signTypedBallotData';
import { cacheSet } from 'modules/cache/cache';
import { TEN_MINUTES_IN_MS } from 'modules/app/constants/time';
import { getRecentlyUsedGaslessVotingKey } from 'modules/cache/constants/cache-keys';
import { config } from 'lib/config';
import { fetchAddressPollVoteHistory } from 'modules/polling/api/fetchAddressPollVoteHistory';
import { SupportedNetworks } from 'modules/web3/constants/networks';
import { getArbitrumPollingContract } from 'modules/polling/helpers/getArbitrumPollingContract';
import logger from 'lib/logger';
import { getPolls } from 'modules/polling/api/fetchPolls';
import { isActivePoll } from 'modules/polling/helpers/utils';
import { recentlyUsedGaslessVotingCheck } from 'modules/polling/helpers/recentlyUsedGaslessVotingCheck';
import { hasMkrRequiredVotingWeight } from 'modules/polling/helpers/hasMkrRequiredVotingWeight';
import { MIN_MKR_REQUIRED_FOR_GASLESS_VOTING } from 'modules/polling/polling.constants';
import { postRequestToDiscord } from 'modules/app/api/postRequestToDiscord';

export const API_VOTE_ERRORS = {
  VOTER_MUST_BE_STRING: 'voter must be a string',
  POLLIDS_MUST_BE_ARRAY_NUMBERS: 'pollIds must be an array of numbers',
  OPTIONIDS_MUST_BE_ARRAY_NUMBERS: 'optionIds must be an array of numbers',
  NONCE_MUST_BE_NUMBER: 'nonce must be a number',
  EXPIRY_MUST_BE_NUMBER: 'expiry must be a number',
  SIGNATURE_MUST_BE_STRING: 'signature must be a string',
  INVALID_NETWORK: 'invalid network',
  WRONG_SECRET: 'Wrong secret',
  INVALID_NONCE_FOR_ADDRESS: 'Invalid nonce for address',
  EXPIRED_VOTES: 'Expiration date already passed',
  EXPIRED_POLLS: 'Can only vote in active polls',
  RATE_LIMITED: 'Address cannot use gasless service more than once per 10 minutes',
  VOTER_AND_SIGNER_DIFFER: 'Voter address could not be recovered from signature',
  LESS_THAN_MINIMUM_MKR_REQUIRED: `Address must have a poll voting weight of at least ${MIN_MKR_REQUIRED_FOR_GASLESS_VOTING.toString()}`
};

//TODO: add swagger documentation
export default withApiHandler(
  async (req: NextApiRequest, res: NextApiResponse) => {
    try {
      const { voter, pollIds, optionIds, nonce, expiry, signature, network, secret } = req.body;

      if (typeof voter !== 'string' || !voter) {
        return res.status(400).json({
          error: API_VOTE_ERRORS.VOTER_MUST_BE_STRING
        });
      }
      if (!Array.isArray(pollIds) || !pollIds.every(e => !isNaN(parseInt(e)))) {
        return res.status(400).json({
          error: API_VOTE_ERRORS.POLLIDS_MUST_BE_ARRAY_NUMBERS
        });
      }
      if (!Array.isArray(optionIds) || !optionIds.every(e => !isNaN(parseInt(e)))) {
        return res.status(400).json({
          error: API_VOTE_ERRORS.OPTIONIDS_MUST_BE_ARRAY_NUMBERS
        });
      }
      if (typeof nonce !== 'number') {
        return res.status(400).json({
          error: API_VOTE_ERRORS.NONCE_MUST_BE_NUMBER
        });
      }
      if (typeof expiry !== 'number') {
        return res.status(400).json({
          error: API_VOTE_ERRORS.EXPIRY_MUST_BE_NUMBER
        });
      }

      if (expiry <= Date.now() / 1000) {
        return res.status(400).json({
          error: API_VOTE_ERRORS.EXPIRED_VOTES
        });
      }

      if (typeof signature !== 'string' || !signature) {
        return res.status(400).json({
          error: API_VOTE_ERRORS.SIGNATURE_MUST_BE_STRING
        });
      }

      if (!Object.values(SupportedNetworks).includes(network)) {
        return res.status(400).json({
          error: API_VOTE_ERRORS.INVALID_NETWORK
        });
      }

      if (secret && secret !== config.GASLESS_BACKDOOR_SECRET) {
        return res.status(400).json({
          error: API_VOTE_ERRORS.WRONG_SECRET
        });
      }

      const pollingContract = getArbitrumPollingContract();

      //verify valid nonce and expiry date
      const nonceFromContract = await pollingContract.nonces(voter);
      if (nonceFromContract.toNumber() !== nonce) {
        return res.status(400).json({
          error: API_VOTE_ERRORS.INVALID_NONCE_FOR_ADDRESS
        });
      }

      //verify that signature and address correspond
      const recovered = recoverTypedSignature({
        data: getTypedBallotData({ voter, pollIds, optionIds, nonce, expiry }, network),
        signature,
        version: SignTypedDataVersion.V4
      });

      if (ethers.utils.getAddress(recovered) !== ethers.utils.getAddress(voter)) {
        return res.status(400).json({
          error: API_VOTE_ERRORS.VOTER_AND_SIGNER_DIFFER
        });
      }

      //run eligibility checks unless backdoor secret provided
      if (!secret || secret !== config.GASLESS_BACKDOOR_SECRET) {
        //verify address has a poll weight > 0.1 MKR
        const hasMkrRequired = await hasMkrRequiredVotingWeight(
          voter,
          network,
          MIN_MKR_REQUIRED_FOR_GASLESS_VOTING
        );

        if (!hasMkrRequired) {
          //ether's bignumber library doesnt handle decimals
          return res.status(400).json({
            error: API_VOTE_ERRORS.LESS_THAN_MINIMUM_MKR_REQUIRED
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
          return res.status(400).json({
            error: API_VOTE_ERRORS.EXPIRED_POLLS
          });
        }

        //check that address hasn't used gasless service recently
        const recentlyUsedGaslessVoting = await recentlyUsedGaslessVotingCheck(voter, network);
        if (recentlyUsedGaslessVoting) {
          return res.status(400).json({
            error: API_VOTE_ERRORS.RATE_LIMITED
          });
        }

        //can't use gasless service to vote in a poll you've already voted on
        // TODO: Consider if we really want this check. We should allow users to vote multiple times on a poll ( edit votes )
        const voteHistory = await fetchAddressPollVoteHistory(voter, network);
        const votedPollIds = voteHistory.map(v => v.pollId);
        const areUnvoted = pollIds.map(pollId => !votedPollIds.includes(parseInt(pollId)));
        if (areUnvoted.includes(false)) return res.status(400).json('Already voted in poll');
      }

      const r = signature.slice(0, 66);
      const s = '0x' + signature.slice(66, 130);
      const v = Number('0x' + signature.slice(130, 132));

      const cacheKey = getRecentlyUsedGaslessVotingKey(voter);
      cacheSet(cacheKey, JSON.stringify(Date.now()), network, TEN_MINUTES_IN_MS);

      const tx = await pollingContract[
        'vote(address,uint256,uint256,uint256[],uint256[],uint8,bytes32,bytes32)'
      ](voter, nonce, expiry, pollIds, optionIds, v, r, s);

      return res.status(200).json(tx);
    } catch (err) {
      if (config.GASLESS_WEBHOOK_URL) {
        await postRequestToDiscord(config.GASLESS_WEBHOOK_URL, JSON.stringify(err));
      }
      logger.error(err);
      return res.status(400).json(`Error: ${err.message}`);
    }
  },
  { allowPost: true }
);
