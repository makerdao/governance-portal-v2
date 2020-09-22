import { Flex, Text, Button, Link as ExternalLink } from 'theme-ui';
import { Icon } from '@makerdao/dai-ui-icons';
import { ConnectorName } from '../../lib/maker/web3react';
import { AbstractConnector } from '@web3-react/abstract-connector';
import { WalletConnectConnector } from '@web3-react/walletconnect-connector';
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
          <Text color="onSurface" variant="smallText">
            {accountName}
          </Text>
          <Flex sx={{ alignItems: 'center', flexDirection: 'row', mt: 1 }}>
            <AccountIcon account={account} sx={{ mr: 2 }} />
            <Text sx={{ fontFamily: 'body' }}>{formatAddress(account)}</Text>
          </Flex>
        </Flex>
        <Button variant="smallOutline" sx={{ mr: 3, borderRadius: 'small' }} onClick={change}>
          <Text variant="caps" color="onSurface">
            change
            {bpi > 0 && ' wallet'}
          </Text>
        </Button>
      </Flex>
      <Flex
        sx={{
          flexDirection: ['row', 'row'],
          alignItems: 'stretch',
          borderTop: '1px solid',
          borderTopColor: 'secondaryMuted',
          // width: '100%',
          variant: 'text.smallText',
          color: 'onSurface'
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
          onClick={() => navigator.clipboard.writeText(account)}
        >
          <Icon name="copy" sx={{ pr: 1 }} />
          Copy Address
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
            borderLeftColor: [null, 'secondaryMuted'],
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
        {accountName === 'WalletConnect' && (
          <Flex
            onClick={() => (connector as WalletConnectConnector).walletConnectProvider.disconnect()}
            sx={{
              borderLeft: ['0', '1px solid'],
              borderColor: 'secondaryMuted',
              justifyContent: 'center',
              alignItems: 'center',
              cursor: 'pointer',
              p: 2
            }}
          >
            Disconnect
          </Flex>
        )}
      </Flex>
    </Flex>
  );
};

export default AccountBox;
