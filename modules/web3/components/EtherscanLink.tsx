/*

SPDX-FileCopyrightText: © 2023 Dai Foundation <www.daifoundation.org>

SPDX-License-Identifier: AGPL-3.0-or-later

*/

import { ExternalLink } from 'modules/app/components/ExternalLink';
import { Box, Text, ThemeUIStyleObject } from 'theme-ui';
import { CHAIN_INFO, SupportedNetworks } from '../constants/networks';
import { getBlockExplorerName, networkNameToChainId } from '../helpers/chain';
import { getEtherscanLink } from '../helpers/getEtherscanLink';
import Icon from 'modules/app/components/Icon';
import { formatAddress } from 'lib/utils';
import React from 'react';

export default function EtherscanLink({
  network,
  hash,
  type,
  showAddress = false,
  showBlockExplorerName = true,
  prefix = 'View on ',
  suffix = '',
  styles
}: {
  network: SupportedNetworks;
  hash: string;
  type: 'transaction' | 'address';
  showAddress?: boolean;
  showBlockExplorerName?: boolean;
  prefix?: string;
  suffix?: string;
  styles?: ThemeUIStyleObject;
}): React.ReactElement {
  const blockExplorerName = getBlockExplorerName(network);
  const chainId = networkNameToChainId(network);
  const isGasless = CHAIN_INFO[chainId]?.type === 'gasless';

  return (
    <Box sx={{ color: 'accentBlue' }}>
      <ExternalLink href={getEtherscanLink(network, hash, type)} title={`View on ${blockExplorerName}`}>
        <Text
          sx={{ color: 'inherit', display: 'flex', alignItems: 'center', width: '100%', ...(styles || {}) }}
        >
          {showAddress && formatAddress(hash)}
          {!showAddress && (
            <React.Fragment>
              {isGasless && <Icon name="lightningBolt" color="primary" sx={{ size: 3, mr: 1 }} />}
              {prefix}
              {showBlockExplorerName ? blockExplorerName : ''}
              {suffix}
            </React.Fragment>
          )}
          <Icon name="arrowTopRight" sx={{ size: 2, ml: 1 }} color="inherit" />
        </Text>
      </ExternalLink>
    </Box>
  );
}
