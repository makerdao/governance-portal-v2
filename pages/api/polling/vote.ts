import { NextApiRequest, NextApiResponse } from 'next';
import withApiHandler from 'modules/app/api/withApiHandler';
import { DefenderRelayProvider, DefenderRelaySigner } from 'defender-relay-client/lib/ethers';
import { ethers } from 'ethers';

// maybe we should use eth-sdk for this if it supports arb testnet
import PollingContractAbi from 'modules/contracts/abis/arbitrumTestnet/polling.json';

import { config } from 'lib/config';

export default withApiHandler(
  async (req: NextApiRequest, res: NextApiResponse) => {
    try {
      const { voter, pollIds, optionIds, nonce, expiry, v, r, s } = req.body;

      // TODO add all validation here

      // if validation passes, send tx
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
      console.log({ voter, pollIds, optionIds, nonce, expiry, v, r, s });
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
