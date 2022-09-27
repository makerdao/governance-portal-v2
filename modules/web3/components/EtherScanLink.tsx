import { ExternalLink } from 'modules/app/components/ExternalLink';
import { Box, Button, Text, ThemeUIStyleObject } from 'theme-ui';
import { CHAIN_INFO, SupportedNetworks } from '../constants/networks';
import { getBlockExplorerName, networkNameToChainId } from '../helpers/chain';
import { getEtherscanLink } from '../helpers/getEtherscanLink';
import { Icon } from '@makerdao/dai-ui-icons';
import { formatAddress } from 'lib/utils';
import React from 'react';

export default function EtherScanLink({
  network,
  hash,
  type,
  showAddress = false,
  showBlockExplorerName = true,
  prefix = 'View on ',
  suffix = '',
  variant = 'box',
  styles
}: {
  network: SupportedNetworks;
  hash: string;
  type: 'transaction' | 'address';
  showAddress?: boolean;
  showBlockExplorerName?: boolean;
  prefix?: string;
  suffix?: string;
  variant?: 'box' | 'button';
  styles?: ThemeUIStyleObject;
}): React.ReactElement {
  const blockExplorerName = getBlockExplorerName(network);
  const chainId = networkNameToChainId(network);
  const isGasless = CHAIN_INFO[chainId]?.type === 'gasless';

  const content = (
    <ExternalLink href={getEtherscanLink(network, hash, type)} title={`View on ${blockExplorerName}`}>
      <Text
        sx={{ color: 'inherit', display: 'flex', alignItems: 'center', width: '100%', ...(styles || {}) }}
      >
        {showAddress && formatAddress(hash)}
        {!showAddress && (
          <React.Fragment>
            {prefix}
            {isGasless && <Icon name="lightningBolt" color="primary" size={3} mr={1} />}
            {showBlockExplorerName ? blockExplorerName : ''}
            {suffix}
          </React.Fragment>
        )}
        <Icon name="arrowTopRight" size={2} ml={1} color="inherit" />
      </Text>
    </ExternalLink>
  );
  return variant === 'box' ? (
    <Box sx={{ color: 'accentBlue' }}>{content}</Box>
  ) : (
    <Button
      variant="smallOutline"
      sx={{
        color: 'accentBlue',
        borderColor: 'accentBlue',
        borderRadius: 'small',
        '&:hover': {
          color: 'accentBlueEmphasis',
          borderColor: 'accentBlueEmphasis'
        }
      }}
    >
      {content}
    </Button>
  );
}
