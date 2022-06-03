import { NextApiRequest, NextApiResponse } from 'next';
import withApiHandler from 'modules/app/api/withApiHandler';
import { DefenderRelayProvider, DefenderRelaySigner } from 'defender-relay-client/lib/ethers';
import { ethers } from 'ethers';

// maybe we should use eth-sdk for this if it supports arb testnet
import PollingContractAbi from 'modules/contracts/abis/arbitrum-testnet/polling.json';

import { config } from 'lib/config';

export default withApiHandler(
  async (req: NextApiRequest, res: NextApiResponse) => {
    try {
      const { pollIds, pollOptions } = req.body;

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
        '0xc9e7Cf814df8eD7688FAC215D50529242c35A046',
        PollingContractAbi,
        signer
      );

      // TODO replace this with signature from user
      const signature = await signer.signMessage(JSON.stringify({ pollIds, pollOptions }));

      const tx = await pollingContract.vote(pollIds, pollOptions, signature, '');
      res.status(200).json(tx);
    } catch (err) {
      console.error(err);
    }
  },
  { allowPost: true }
);
