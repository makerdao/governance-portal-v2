import { useState } from 'react';
import { Flex, Text, Button, Link as ExternalLink } from 'theme-ui';
import { Icon } from '@makerdao/dai-ui-icons';
import { ConnectorName } from '../../lib/maker/web3react';
import { AbstractConnector } from '@web3-react/abstract-connector';
import { useBreakpointIndex } from '@theme-ui/match-media';

import { formatAddress, getEtherscanLink } from '../../lib/utils';
import { getNetwork } from '../../lib/maker';
import AccountIcon from './AccountIcon';

type Props = {
  account: string;
  accountName: ConnectorName | undefined;
  change: () => void;
  connector: AbstractConnector;
};

const AccountBox = ({ account, accountName, change, connector }: Props): JSX.Element => {
  const bpi = useBreakpointIndex();
  const [copyAddressText, setCopyAddressText] = useState('Copy Address');

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
            <AccountIcon account={account} sx={{ mr: 2 }} />
            <Text sx={{ fontFamily: 'body' }}>{formatAddress(account)}</Text>
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
              backgroundColor: 'background'
            }
          }}
          onClick={() => {
            navigator.clipboard.writeText(account);
            setCopyAddressText('Copied!');
            setTimeout(() => setCopyAddressText('Copy Address'), 1000);
          }}
        >
          <Icon name="copy" sx={{ pr: 1 }} />
          {copyAddressText}
        </Flex>
        <ExternalLink
          href={getEtherscanLink(getNetwork(), account, 'address')}
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
              backgroundColor: 'background'
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
