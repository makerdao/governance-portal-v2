/*

SPDX-FileCopyrightText: © 2023 Dai Foundation <www.daifoundation.org>

SPDX-License-Identifier: AGPL-3.0-or-later

*/

import { Button, Flex, Text } from 'theme-ui';
import { Delegate } from '../../types';
import { useWeb3 } from 'modules/web3/hooks/useWeb3';
import { BigNumber } from 'ethers';
import { formatValue } from 'lib/string';
import EtherscanLink from 'modules/web3/components/EtherscanLink';

type Props = {
  mkrToDeposit: BigNumber;
  delegate: Delegate;
  onClick: () => void;
  onBack: () => void;
};

export const ConfirmContent = ({ mkrToDeposit, delegate, onClick, onBack }: Props): JSX.Element => {
  const { address, voteDelegateAddress } = delegate;
  const { network } = useWeb3();

  return (
    <Flex sx={{ flexDirection: 'column', textAlign: 'center' }}>
      <Text variant="microHeading" sx={{ fontSize: [3, 6] }}>
        Confirm Transaction
      </Text>
      <Text sx={{ mt: 4 }}>
        You are delegating{' '}
        <Text sx={{ fontWeight: 'bold', display: 'inline' }}>{formatValue(mkrToDeposit, 'wad', 6)} MKR</Text>{' '}
        to delegate contract{' '}
        <EtherscanLink
          type="address"
          showAddress
          hash={voteDelegateAddress}
          network={network}
          styles={{ justifyContent: 'center' }}
        />
      </Text>
      <Text sx={{ color: 'secondaryEmphasis', mt: 4 }}>
        This delegate contract was created by{' '}
        <EtherscanLink
          type="address"
          showAddress
          hash={address}
          network={network}
          styles={{ justifyContent: 'center' }}
        />
      </Text>
      <Button onClick={onClick} sx={{ mt: 4 }}>
        Confirm Transaction
      </Button>
      <Button onClick={onBack} variant="textual" sx={{ color: 'secondary', fontSize: 2, mt: 1 }}>
        Back
      </Button>
    </Flex>
  );
};
