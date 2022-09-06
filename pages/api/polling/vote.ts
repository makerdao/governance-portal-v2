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

//TODO: add swagger documentation
export default withApiHandler(
  async (req: NextApiRequest, res: NextApiResponse) => {
    try {
      const { voter, pollIds, optionIds, nonce, expiry, signature, network, secret } = req.body;

      if (typeof voter !== 'string') {
        return res.status(401).json('voter must be a string');
      }
      if (!Array.isArray(pollIds) || !pollIds.every(e => !isNaN(parseInt(e)))) {
        return res.status(401).json('pollIds must be an array of numbers');
      }
      if (!Array.isArray(optionIds) || !optionIds.every(e => !isNaN(parseInt(e)))) {
        return res.status(401).json('optionIds must be an array of numbers');
      }
      if (typeof nonce !== 'number') {
        return res.status(401).json('nonce must be a number');
      }
      if (typeof expiry !== 'number') {
        return res.status(401).json('expiry must be a number');
      }
      if (typeof signature !== 'string') {
        return res.status(401).json('signature must be a string');
      }

      if (!Object.values(SupportedNetworks).includes(network)) {
        return res.status(401).json('invalid network');
      }

      if (secret && secret !== config.GASLESS_BACKDOOR_SECRET) {
        return res.status(401).json('Wrong secret');
      }

      const pollingContract = getArbitrumPollingContract();

      //run eligibility checks unless backdoor secret provided
      if (!secret || secret !== config.GASLESS_BACKDOOR_SECRET) {
        //check that address hasn't used gasless service recently
        const recentlyUsedGaslessVoting = await recentlyUsedGaslessVotingCheck(voter, network);
        if (recentlyUsedGaslessVoting) {
          return res.status(401).json('Address cannot use gasless service more than once per 10 minutes');
        }

        //verify that signature and address correspond
        const recovered = recoverTypedSignature({
          data: getTypedBallotData({ voter, pollIds, optionIds, nonce, expiry }, network),
          signature,
          version: SignTypedDataVersion.V4
        });

        if (ethers.utils.getAddress(recovered) !== ethers.utils.getAddress(voter)) {
          return res.status(400).json('Voter address could not be recovered from signature');
        }

        //verify valid nonce and expiry date
        const nonceFromContract = await pollingContract.nonces(voter);
        if (nonceFromContract.toNumber() !== nonce) {
          return res.status(400).json('Invalid nonce for address');
        }

        if (expiry >= Date.now()) {
          return res.status(400).json('Expiration date already passed');
        }

        //verify address has a poll weight > 0.1 MKR
        const hasMkrRequired = await hasMkrRequiredVotingWeight(
          voter,
          network,
          MIN_MKR_REQUIRED_FOR_GASLESS_VOTING
        );

        if (!hasMkrRequired) {
          //ether's bignumber library doesnt handle decimals
          return res
            .status(400)
            .json(
              `Address must have a poll voting weight of at least ${MIN_MKR_REQUIRED_FOR_GASLESS_VOTING}`
            );
        }

        //verify address hasn't already voted in any of the polls

        const filters = {
          startDate: new Date(),
          endDate: null,
          tags: null
        };

        const pollsResponse = await getPolls(filters, network);
        const areAllPollsActive = pollIds
          .map(pollId => {
            const poll = pollsResponse.polls.find(p => p.pollId === pollId);
            if (!poll || !isActivePoll(poll)) {
              return false;
            }
            return true;
          })
          .reduce((prev, next) => {
            return prev && next;
          });

        if (!areAllPollsActive) {
          return res.status(400).json('Can only vote in active polls');
        }

        //can't use gasless service to vote in a poll you've already voted on
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
      logger.error(err);
      return res.status(400).json(`Error: ${err.message}`);
    }
  },
  { allowPost: true }
);
