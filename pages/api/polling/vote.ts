import { NextApiRequest, NextApiResponse } from 'next';
import withApiHandler from 'modules/app/api/withApiHandler';
import { DefenderRelayProvider, DefenderRelaySigner } from 'defender-relay-client/lib/ethers';
import { ethers } from 'ethers';
import invariant from 'tiny-invariant';
import { recoverTypedSignature } from 'eth-sig-util';
import { getTypedBallotData } from 'modules/web3/helpers/signTypedBallotData';
import { cacheGet, cacheSet } from 'modules/cache/cache';
import { TEN_MINUTES_IN_MS } from 'modules/app/constants/time';
import { getRecentlyUsedGaslessVoting } from 'modules/cache/constants/cache-keys';

// maybe we should use eth-sdk for this if it supports arb testnet
import PollingContractAbi from 'modules/contracts/abis/arbitrumTestnet/polling.json';

import { config } from 'lib/config';

export default withApiHandler(
  async (req: NextApiRequest, res: NextApiResponse) => {
    try {
      const { voter, pollIds, optionIds, nonce, expiry, signature, network } = req.body;
      const r = signature.slice(0, 66);
      const s = '0x' + signature.slice(66, 130);
      const v = Number('0x' + signature.slice(130, 132));
      // TODO add all validation here

      const credentials = { apiKey: config.DEFENDER_API_KEY, apiSecret: config.DEFENDER_API_SECRET };
      const provider = new DefenderRelayProvider(credentials);
      const signer = new DefenderRelaySigner(credentials, provider, {
        speed: 'fast'
      });
      const pollingContract = new ethers.Contract(
        // arbitrum testnet polling address,
        // maybe we should use eth-sdk for this if it's supported
        '0xc5C7bC9f0F54f2F6c441A774Ef93aCf06cE3DfA3',
        PollingContractAbi,
        signer
      );

      const nonceFromContract = await pollingContract.nonces(voter);
      invariant(nonceFromContract.toNumber() === parseInt(nonce),
        'Invalid nonce for address');
      invariant(expiry < Date.now(),
        'Expiration date already passed');
      //verify that signature and address correspond
      // console.log('getTypedBallotData({voter, pollIds, optionIds, nonce, expiry }, network)', getTypedBallotData({voter, pollIds, optionIds, nonce, expiry }, network));
      // console.log('signature', signature);
      // const recovered = recoverTypedSignature({
      //   data: getTypedBallotData({voter, pollIds, optionIds, nonce, expiry }, network),
      //   signature,
      //   version: 'V4'
      // });
      // console.log('recovered signature', recovered);
      // invariant (
      //   ethers.utils.getAddress(recovered) === ethers.utils.getAddress(voter),
      //   'Failed to verify signer when comparing ' + recovered + ' to ' + voter
      // );

      const cacheKey = getRecentlyUsedGaslessVoting(voter);
      const recentlyUsedGaslessVoting = await cacheGet(cacheKey, network);
      console.log('recentlyUsedGaslessVoting', recentlyUsedGaslessVoting);
      invariant(!recentlyUsedGaslessVoting, 'Address cannot use gasless service more than once per 10 minutes');
      cacheSet(cacheKey, JSON.stringify(Date.now()), network, TEN_MINUTES_IN_MS);
      // if validation passes, send tx
      const tx = await pollingContract[
        'vote(address,uint256,uint256,uint256[],uint256[],uint8,bytes32,bytes32)'
      ](voter, nonce, expiry, pollIds, optionIds, v, r, s);

      res.status(200).json(tx);
    } catch (err) {
      console.error(err);
    }
  },
  { allowPost: true }
);
