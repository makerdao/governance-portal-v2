/*

SPDX-FileCopyrightText: © 2023 Dai Foundation <www.daifoundation.org>

SPDX-License-Identifier: AGPL-3.0-or-later

*/

import { useState } from 'react';
import { Flex, Text, Box, Button } from 'theme-ui';
import Icon from '../../Icon';
import { formatAddress } from 'lib/utils';
import AddressIcon from 'modules/address/components/AddressIcon';
import { InternalLink } from 'modules/app/components/InternalLink';
import EtherscanLink from 'modules/web3/components/EtherscanLink';
import { useNetwork } from 'modules/app/hooks/useNetwork';

type Props = {
  address: string;
  accountName?: string;
  change: () => void;
  disconnect: () => void;
};

const AccountBox = ({ address, accountName, change, disconnect }: Props): JSX.Element => {
  const [copied, setCopied] = useState(false);
  const network = useNetwork();

  return (
    <Flex sx={{ flexDirection: 'column' }}>
      <Flex sx={{ alignItems: 'center', justifyContent: 'space-between' }}>
        <Flex>
          {accountName && <Icon name={accountName} sx={{ size: '24px' }} />}
          <Text variant="secondary" sx={{ ml: 2 }}>
            Connected with {accountName}
          </Text>
        </Flex>
        <Button variant="mutedOutline" onClick={change} data-testid="wallet-change-button">
          Change
        </Button>
      </Flex>
      <Flex sx={{ justifyContent: 'space-between', alignItems: 'center', mt: 3 }}>
        <Flex sx={{ alignItems: 'center', flexDirection: 'row', mt: 1 }}>
          <Box sx={{ mr: 2 }}>
            <AddressIcon address={address} width={22} />
          </Box>
          <Text data-testid="current-wallet" sx={{ fontWeight: 500 }}>
            {formatAddress(address).toLowerCase()}
          </Text>
        </Flex>
        <Flex
          sx={{
            justifyContent: 'center',
            alignItems: 'center'
          }}
          onClick={() => {
            navigator.clipboard.writeText(address);
            setCopied(true);
            setTimeout(() => setCopied(false), 1000);
          }}
          data-testid="copy-address"
        >
          <Text variant="secondary">{copied ? 'Copied!' : 'Copy Address'}</Text>
          <Icon name="copy" color="textSecondary" sx={{ ml: 2, size: '14px' }} />
        </Flex>
      </Flex>
      <Flex
        sx={{
          mt: 3,
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}
      >
        <EtherscanLink hash={address} type="address" network={network} />
        <Button variant="mutedOutline" onClick={disconnect}>
          Disconnect
        </Button>
      </Flex>
      <Flex sx={{ mt: 3, justifyContent: 'center' }}>
        <InternalLink
          href={'/account'}
          title="View account page"
          styles={{ color: 'accentBlue', width: '100%' }}
        >
          <Button variant="primaryOutline" sx={{ width: '100%' }} data-testid="view-account-page-button">
            View account page
          </Button>
        </InternalLink>
      </Flex>
    </Flex>
  );
};

export default AccountBox;
