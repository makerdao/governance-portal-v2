import { NextApiRequest, NextApiResponse } from 'next';
import withApiHandler from 'modules/app/api/withApiHandler';
import { DefenderRelayProvider, DefenderRelaySigner } from 'defender-relay-client/lib/ethers';
import { ethers } from 'ethers';
import { recoverTypedSignature, SignTypedDataVersion } from '@metamask/eth-sig-util';
import { getTypedBallotData } from 'modules/web3/helpers/signTypedBallotData';
import { cacheGet, cacheSet } from 'modules/cache/cache';
import { TEN_MINUTES_IN_MS } from 'modules/app/constants/time';
import { getRecentlyUsedGaslessVoting } from 'modules/cache/constants/cache-keys';
import { getMKRVotingWeight, MKRVotingWeightResponse } from 'modules/mkr/helpers/getMKRVotingWeight';
// maybe we should use eth-sdk for this if it supports arb testnet
import PollingContractAbi from 'modules/contracts/abis/arbitrumTestnet/polling.json';
import { config } from 'lib/config';
import { fetchJson } from 'lib/fetchJson';
import { WAD } from 'modules/web3/constants/numbers';
import { fetchAddressPollVoteHistory } from 'modules/polling/api/fetchAddressPollVoteHistory';
import { SupportedNetworks } from 'modules/web3/constants/networks';

const MIN_MKR = 0.1;

//TODO: add swagger documentation
export default withApiHandler(
  async (req: NextApiRequest, res: NextApiResponse) => {
    try {
      const { voter, pollIds, optionIds, nonce, expiry, signature, network, secret } = req.body;

      if (typeof voter !== 'string') return res.status(401).json('voter must be a string');
      if (!Array.isArray(pollIds) || !pollIds.every(e => !isNaN(parseInt(e))))
        return res.status(401).json('pollIds must be an array of numbers');
      if (!Array.isArray(optionIds) || !optionIds.every(e => !isNaN(parseInt(e))))
        return res.status(401).json('optionIds must be an array of numbers');
      if (typeof nonce !== 'number') return res.status(401).json('nonce must be a number');
      if (typeof expiry !== 'number') return res.status(401).json('expiry must be a number');
      if (typeof signature !== 'string') return res.status(401).json('signature must be a string');
      if (!Object.values(SupportedNetworks).includes(network)) return res.status(401).json('invalid network');

      const cacheKey = getRecentlyUsedGaslessVoting(voter);

      const credentials = { apiKey: config.DEFENDER_API_KEY, apiSecret: config.DEFENDER_API_SECRET };
      const provider = new DefenderRelayProvider(credentials);
      const signer = new DefenderRelaySigner(credentials, provider, {
        speed: 'fast'
      });
      const pollingContract = new ethers.Contract(
        // arbitrum testnet polling address,
        // maybe we should use eth-sdk for this if it's supported
        '0x4d196378e636D22766d6A9C6C6f4F32AD3ECB050',
        PollingContractAbi,
        signer
      );

      if (secret && secret !== config.GASLESS_BACKDOOR_SECRET) return res.status(401).json('Wrong secret');

      //run eligibility checks unless backdoor secret provided
      if (!secret || secret !== config.GASLESS_BACKDOOR_SECRET) {
        //check that address hasn't used gasless service recently
        const recentlyUsedGaslessVoting = await cacheGet(cacheKey, network);
        if (recentlyUsedGaslessVoting)
          return res.status(401).json('Address cannot use gasless service more than once per 10 minutes');

        //verify that signature and address correspond
        const recovered = recoverTypedSignature({
          data: getTypedBallotData({ voter, pollIds, optionIds, nonce, expiry }, network),
          signature,
          version: SignTypedDataVersion.V4
        });
        if (ethers.utils.getAddress(recovered) !== ethers.utils.getAddress(voter))
          return res.status(400).json('Voter address could not be recovered from signature');

        //verify valid nonce and expiry date
        const nonceFromContract = await pollingContract.nonces(voter);
        if (nonceFromContract.toNumber() !== parseInt(nonce))
          return res.status(400).json('Invalid nonce for address');
        if (expiry >= Date.now()) return res.status(400).json('Expiration date already passed');

        //verify address has a poll weight > 0.1 MKR
        const pollWeight: MKRVotingWeightResponse = await getMKRVotingWeight(voter, network);
        if (pollWeight.total.lt(WAD.div(1 / MIN_MKR)))
          //ether's bignumber library doesnt handle decimals
          return res.status(400).json(`Address must have a poll voting weight of at least ${MIN_MKR}`);

        //verify address hasn't already voted in any of the polls
        const allPollsResponse = await fetchJson(
          //get all active polls
          `https://vote.makerdao.com/api/polling/all-polls?network=${network}&startDate=${new Date().toString()}`
        );
        const activePollIds = allPollsResponse.polls.map(p => parseInt(p.pollId));
        const areActive = pollIds.map(pollId => activePollIds.includes(parseInt(pollId)));
        if (areActive.includes(false)) return res.status(400).json('Can only vote in active polls');

        //can't use gasless service to vote in a poll you've already voted on
        const voteHistory = await fetchAddressPollVoteHistory(voter, network);
        const votedPollIds = voteHistory.map(v => v.pollId);
        const areUnvoted = pollIds.map(pollId => !votedPollIds.includes(parseInt(pollId)));
        if (areUnvoted.includes(false)) return res.status(400).json('Already voted in poll');
      }

      const r = signature.slice(0, 66);
      const s = '0x' + signature.slice(66, 130);
      const v = Number('0x' + signature.slice(130, 132));

      cacheSet(cacheKey, JSON.stringify(Date.now()), network, TEN_MINUTES_IN_MS);

      const tx = await pollingContract[
        'vote(address,uint256,uint256,uint256[],uint256[],uint8,bytes32,bytes32)'
      ](voter, nonce, expiry, pollIds, optionIds, v, r, s);

      return res.status(200).json(tx);
    } catch (err) {
      return res.status(400).json('Error');
    }
  },
  { allowPost: true }
);
