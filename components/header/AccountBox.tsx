import { Flex, Text, Button, Link as ExternalLink } from 'theme-ui';
import { formatAddress } from '../../lib/utils';
import { Icon } from '@makerdao/dai-ui-icons';
import AccountIcon from './AccountIcon';

const AccountBox = ({ account, accountName, change }) => (
  <>
    <Flex sx={{ flexDirection: 'column', border: '1px solid #D4D9E1', borderRadius: 'medium' }}>
      <Flex sx={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
        <Flex sx={{ flexDirection: 'column', ml: 3, py: 3 }}>
          <Text color="onSurface" variant="smallText">
            {accountName}
          </Text>
          <Flex sx={{ alignItems: 'center', flexDirection: 'row', mt: 1 }}>
            <AccountIcon account={account} mr={2} />
            <Text sx={{ fontFamily: 'body' }}>{formatAddress(account)}</Text>
          </Flex>
        </Flex>
        <Button variant="smallOutline" sx={{ mr: 3, borderRadius: 'small' }} onClick={change}>
          <Text variant="caps" color="onSurface">
            CHANGE&nbsp;WALLET
          </Text>
        </Button>
      </Flex>
      <Flex sx={{ flexDirection: 'row', borderTop: '1px solid #D4D9E1', width: '100%', cursor: 'copy' }}>
        <Flex
          sx={{ width: '50%', justifyContent: 'center', alignItems: 'center', py: 2 }}
          onClick={() => navigator.clipboard.writeText(account)}
        >
          <Icon name="copy" sx={{ pr: 1 }} />
          <Text variant="smallText" color="onSurface">
            Copy Address
          </Text>
        </Flex>
        <ExternalLink
          href={`https://etherscan.io/address/${account}`}
          target="_blank"
          sx={{ width: '50%', height: '100%' }}
        >
          <Flex
            sx={{
              width: '100%',
              justifyContent: 'center',
              alignItems: 'baseline',
              flexDirection: 'row',
              borderLeft: '1px solid #D4D9E1',
              py: 2
            }}
          >
            <Text variant="smallText" color="onSurface">
              View on Etherscan
            </Text>
            <Icon name="arrowTopRight" color="accentBlue" size={2} sx={{ ml: 1 }} />
          </Flex>
        </ExternalLink>
      </Flex>
    </Flex>
  </>
);

export default AccountBox;
