/*

SPDX-FileCopyrightText: © 2023 Dai Foundation <www.daifoundation.org>

SPDX-License-Identifier: AGPL-3.0-or-later

*/

import { NextApiRequest, NextApiResponse } from 'next';
import withApiHandler from 'modules/app/api/withApiHandler';
import { getTypedBallotData } from 'modules/web3/helpers/signTypedBallotData';
import { ApiError } from 'modules/app/api/ApiError';
import { isSupportedNetwork } from 'modules/web3/helpers/networks';
import { createWalletClient, fallback, http } from 'viem';
import { ONE_HOUR_IN_MS } from 'modules/app/constants/time';
import { privateKeyToAccount } from 'viem/accounts';
import { SupportedNetworks } from 'modules/web3/constants/networks';
import { tenderly } from 'modules/wagmi/config/config.default';
import { mainnet } from 'viem/chains';

const genRanHex = (size: number) =>
  [...Array(size)].map(() => Math.floor(Math.random() * 16).toString(16)).join('');

export default withApiHandler(async (req: NextApiRequest, res: NextApiResponse) => {
  const { network } = req.query;
  if (typeof network !== 'string' || !network || !isSupportedNetwork(network)) {
    const error = 'Invalid or missing network query param';
    throw new ApiError(error, 400, error);
  }

  const isTestnet = network === SupportedNetworks.TENDERLY;
  const chain = isTestnet ? tenderly : mainnet;
  const privateKey = '0x' + genRanHex(64);
  const account = privateKeyToAccount(privateKey as `0x${string}`);

  const client = createWalletClient({
    account,
    chain,
    transport: isTestnet
      ? http(`https://virtual.mainnet.rpc.tenderly.co/${process.env.NEXT_PUBLIC_TENDERLY_RPC_KEY}`)
      : fallback([http(process.env.NEXT_PUBLIC_RPC_MAINNET || '')])
  });

  const voter = account.address;

  const pollIds = ['1'];
  const optionIds = ['0'];
  const nonce = 0;
  const expiry = Math.trunc((Date.now() + 8 * ONE_HOUR_IN_MS) / 1000); //8 hour expiry
  const signatureValues = {
    voter: voter.toLowerCase(),
    pollIds,
    optionIds,
    nonce,
    expiry
  };
  const { domain, types, message, primaryType } = getTypedBallotData(signatureValues, network);

  const signature = await client.signTypedData({ domain, types, message, primaryType });
  res.status(200).json({ signature, voter, nonce, expiry, pollIds, optionIds, network });
});
