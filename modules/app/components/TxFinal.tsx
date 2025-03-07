/*

SPDX-FileCopyrightText: © 2023 Dai Foundation <www.daifoundation.org>

SPDX-License-Identifier: AGPL-3.0-or-later

*/

import { Box, Button, Flex, Text } from 'theme-ui';
import TxIndicators from 'modules/app/components/TxIndicators';
import EtherscanLink from 'modules/web3/components/EtherscanLink';
import { useNetwork } from '../hooks/useNetwork';

export const TxFinal = ({
  title,
  description,
  buttonLabel,
  onClick,
  txHash,
  success,
  children
}: {
  title: string;
  description: string | JSX.Element;
  buttonLabel: string;
  onClick: () => void;
  txHash: `0x${string}` | undefined;
  success: boolean;
  children?: React.ReactNode;
}): React.ReactElement => {
  const network = useNetwork();

  return (
    <Flex sx={{ flexDirection: 'column', textAlign: 'center' }}>
      <Text variant="microHeading">{title}</Text>
      {success ? (
        <Flex sx={{ alignItems: 'center', justifyContent: 'center', mt: 4 }}>
          <TxIndicators.Success sx={{ width: 6 }} />
        </Flex>
      ) : (
        <Flex sx={{ alignItems: 'center', justifyContent: 'center', mt: 4 }}>
          <TxIndicators.Failed sx={{ width: 6 }} />
        </Flex>
      )}
      <Flex sx={{ justifyContent: 'center' }}>
        <Text sx={{ color: 'secondaryEmphasis', mt: 3 }}>{description}</Text>
      </Flex>
      {children}

      {txHash && (
        <Box my={3}>
          <EtherscanLink
            hash={txHash}
            type="transaction"
            network={network}
            styles={{ justifyContent: 'center' }}
          />
        </Box>
      )}

      <Button data-testid="txfinal-btn" onClick={onClick} sx={{ width: '100%', mt: 3 }}>
        {buttonLabel}
      </Button>
    </Flex>
  );
};
