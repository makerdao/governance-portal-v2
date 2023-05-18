/*

SPDX-FileCopyrightText: © 2023 Dai Foundation <www.daifoundation.org>

SPDX-License-Identifier: AGPL-3.0-or-later

*/

import { NextApiRequest, NextApiResponse } from 'next';
import withApiHandler from 'modules/app/api/withApiHandler';
import { getRecentlyUsedGaslessVotingKey } from 'modules/cache/constants/cache-keys';
import { cacheGet } from 'modules/cache/cache';
import { DEFAULT_NETWORK, SupportedNetworks } from 'modules/web3/constants/networks';
import { hasMkrRequiredVotingWeight } from 'modules/polling/helpers/hasMkrRequiredVotingWeight';
import { MIN_MKR_REQUIRED_FOR_GASLESS_VOTING } from 'modules/polling/polling.constants';
import { ballotIncludesAlreadyVoted } from 'modules/polling/helpers/ballotIncludesAlreadyVoted';
import { getRelayerBalance } from 'modules/polling/api/getRelayerBalance';
import { ApiError } from 'modules/app/api/ApiError';
import { config } from 'lib/config';
import validateQueryParam from 'modules/app/api/validateQueryParam';
import { validateAddress } from 'modules/web3/api/validateAddress';

export default withApiHandler(async (req: NextApiRequest, res: NextApiResponse) => {
  // validate network
  const network = validateQueryParam(
    (req.query.network as SupportedNetworks) || DEFAULT_NETWORK.network,
    'string',
    {
      defaultValue: null,
      validValues: [SupportedNetworks.GOERLI, SupportedNetworks.GOERLIFORK, SupportedNetworks.MAINNET]
    },
    n => !!n,
    new ApiError('Invalid network', 400, 'Invalid network')
  ) as SupportedNetworks;

  // validate these below
  const pollIds = req.query.pollIds as string;

  const pollIdsArray = pollIds.split(',');

  if (!pollIds || pollIdsArray.length === 0) {
    throw new ApiError('Gasless precheck: Missing parameters', 400, 'No poll ids provided');
  }

  const [voter, delegateAddress, proxyAddress] = await Promise.all([
    validateAddress(
      req.query.voter as string,
      new ApiError('Gasless precheck: Invalid address', 400, 'Invalid address')
    ),
    !req.query.delegateAddress
      ? ''
      : validateAddress(
          req.query.delegateAddress as string,
          new ApiError('Gasless precheck: Invalid address', 400, 'Invalid address')
        ),
    !req.query.proxyAddress
      ? ''
      : validateAddress(
          req.query.proxyAddress as string,
          new ApiError('Gasless precheck: Invalid address', 400, 'Invalid address')
        )
  ]);

  // Use the same address that's used in the vote endpoint
  // to store the last gasless vote date
  const addressDisplayedAsVoter = delegateAddress ? delegateAddress : proxyAddress ? proxyAddress : voter;
  const DelegateElseWalletAddress = delegateAddress ? delegateAddress : voter;

  const cacheKey = getRecentlyUsedGaslessVotingKey(addressDisplayedAsVoter);
  const [recentlyUsedGaslessVoting, hasMkrRequired, alreadyVoted, relayBalance] = await Promise.all([
    cacheGet(cacheKey, network),
    hasMkrRequiredVotingWeight(DelegateElseWalletAddress, network, MIN_MKR_REQUIRED_FOR_GASLESS_VOTING, true),
    ballotIncludesAlreadyVoted(DelegateElseWalletAddress, network, pollIdsArray),
    getRelayerBalance(network)
  ]);

  return res.status(200).json({
    recentlyUsedGaslessVoting,
    hasMkrRequired,
    alreadyVoted,
    relayBalance,
    gaslessDisabled: config.GASLESS_DISABLED
  });
});
