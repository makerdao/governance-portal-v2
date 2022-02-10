import { useState } from 'react';
import { Flex, Text, Box, Button, Link as ExternalLink } from 'theme-ui';
import { Icon } from '@makerdao/dai-ui-icons';
import { useBreakpointIndex } from '@theme-ui/match-media';

import { formatAddress } from 'lib/utils';
import { useActiveWeb3React } from 'modules/web3/hooks/useActiveWeb3React';
import AddressIcon from 'modules/address/components/AddressIcon';
import { ConnectorName } from 'modules/web3/types/connectors';
import { getEtherscanLink } from 'modules/web3/helpers/getEtherscanLink';
import AddressIconBox from 'modules/address/components/AddressIconBox';

type Props = {
  address: string;
  accountName: ConnectorName | undefined;
  change: () => void;
};

const AccountBox = ({ address, accountName, change }: Props): JSX.Element => {
  const bpi = useBreakpointIndex();
  const [copied, setCopied] = useState(false);
  const { network } = useActiveWeb3React();

  return (
    <Flex
      sx={{
        flexDirection: 'column',
        border: '1px solid',
        borderColor: 'secondaryMuted',
        borderRadius: 'medium'
      }}
    >
      <Flex sx={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
        <Flex sx={{ flexDirection: 'column', ml: 3, py: 3 }}>
          <Text color="textSecondary" variant="smallText">
            {accountName}
          </Text>
          <Flex sx={{ alignItems: 'center', flexDirection: 'row', mt: 1 }}>
            <Box sx={{ mr: 2 }}>
              <AddressIcon address={address} width={22} />
            </Box>
            <Text sx={{ fontFamily: 'body' }} data-testid="current-wallet">
              {formatAddress(address).toLowerCase()}
            </Text>
          </Flex>
        </Flex>
        <Button variant="smallOutline" sx={{ mr: 3, borderRadius: 'small' }} onClick={change}>
          <Text variant="text.caps" sx={{ color: 'textSecondary', fontSize: 1, px: 1, pt: '1px' }}>
            change
            {bpi > 0 && ' wallet'}
          </Text>
        </Button>
      </Flex>
      <Flex
        sx={{
          flexDirection: 'row',
          alignItems: 'stretch',
          borderTop: '1px solid',
          borderTopColor: 'secondaryMuted',
          variant: 'text.smallText',
          color: 'textSecondary'
        }}
      >
        <Flex
          sx={{
            justifyContent: 'center',
            alignItems: 'center',
            p: 2,
            cursor: 'pointer',
            flex: 1,
            '&:hover': {
              color: 'text',
              backgroundColor: 'background',
              borderBottomLeftRadius: 'medium'
            }
          }}
          onClick={() => {
            navigator.clipboard.writeText(address);
            setCopied(true);
            setTimeout(() => setCopied(false), 1000);
          }}
          data-testid="copy-address"
        >
          <Icon name="copy" sx={{ pr: 1 }} />
          {copied ? 'Copied!' : 'Copy Address'}
        </Flex>
        <ExternalLink
          href={getEtherscanLink(network, address, 'address')}
          target="_blank"
          sx={{
            whiteSpace: 'nowrap',
            display: 'flex',
            flexDirection: 'row',
            justifyContent: 'center',
            alignItems: 'center',
            borderLeft: '1px solid',
            borderLeftColor: 'secondaryMuted',
            color: 'accentBlue',
            p: 2,
            flex: 1,
            '&:hover': {
              color: 'blueLinkHover',
              backgroundColor: 'background',
              borderBottomRightRadius: 'medium'
            }
          }}
        >
          View on Etherscan
          <Icon name="arrowTopRight" size={2} sx={{ ml: 1 }} />
        </ExternalLink>
      </Flex>
    </Flex>
  );
};

export default AccountBox;
