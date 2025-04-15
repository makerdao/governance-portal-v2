/*

SPDX-FileCopyrightText: © 2023 Dai Foundation <www.daifoundation.org>

SPDX-License-Identifier: AGPL-3.0-or-later

*/

import { Card, Flex, Link as ExternalLink, Text, Box, Heading } from 'theme-ui';
import Icon from './Icon';
import Skeleton from 'modules/app/components/SkeletonThemed';
import Stack from './layout/layouts/Stack';
import { useSystemWideDebtCeiling } from 'modules/web3/hooks/useSystemWideDebtCeiling';
import { useSystemSurplus } from 'modules/web3/hooks/useSystemSurplus';
import { useTotalDai } from 'modules/web3/hooks/useTotalDai';
import { useDaiSavingsRate } from 'modules/web3/hooks/useDaiSavingsRate';
import { useTokenBalance } from 'modules/web3/hooks/useTokenBalance';
import { useMkrOnHat } from 'modules/executive/hooks/useMkrOnHat';
import { formatValue } from 'lib/string';
import { Tokens } from 'modules/web3/constants/tokens';
import { ArbitrumPollingAddressMap } from 'modules/web3/constants/addresses';
import { SupportedNetworks } from 'modules/web3/constants/networks';
import EtherscanLink from 'modules/web3/components/EtherscanLink';
import { useNetwork } from '../hooks/useNetwork';
import { useChainId } from 'wagmi';
import {
  chiefAddress as chiefAddressMapping,
  pollingAddress as pollingAddressMapping
} from 'modules/contracts/generated';

type StatField =
  | 'chief contract'
  | 'mainnet polling contract'
  | 'arbitrum polling contract'
  | 'sky in chief'
  | 'sky needed to pass'
  | 'savings rate'
  | 'total dai'
  | 'debt ceiling'
  | 'system surplus';

export default function SystemStatsSidebar({
  fields = [],
  className
}: {
  fields: StatField[];
  className?: string;
}): JSX.Element {
  const network = useNetwork();
  const chainId = useChainId();

  const statsMap = {
    'chief contract': key => {
      const chiefAddress = chiefAddressMapping[chainId];

      return (
        <Flex key={key} sx={{ justifyContent: 'space-between', flexDirection: 'row' }}>
          <Text sx={{ fontSize: 3, color: 'textSecondary' }}>Chief Contract</Text>
          <Text variant="h2" sx={{ fontSize: 3 }}>
            {chiefAddress ? (
              <EtherscanLink hash={chiefAddress} type="address" network={network} showAddress />
            ) : (
              <Box sx={{ width: 6 }}>
                <Skeleton />
              </Box>
            )}
          </Text>
        </Flex>
      );
    },
    'sky in chief': key => {
      const chiefAddress = chiefAddressMapping[chainId];
      const { data: chiefBalance } = useTokenBalance(Tokens.MKR, chiefAddress);

      return (
        <Flex key={key} sx={{ justifyContent: 'space-between', flexDirection: 'row' }}>
          <Text sx={{ fontSize: 3, color: 'textSecondary' }}>SKY in Chief</Text>
          <Text variant="h2" sx={{ fontSize: 3 }}>
            {chiefBalance ? (
              `${formatValue(chiefBalance)} SKY`
            ) : (
              <Box sx={{ width: 6 }}>
                <Skeleton />
              </Box>
            )}
          </Text>
        </Flex>
      );
    },

    'mainnet polling contract': key => {
      const pollingAddress = pollingAddressMapping[chainId];

      return (
        <Flex key={key} sx={{ justifyContent: 'space-between', flexDirection: 'row' }}>
          <Text sx={{ fontSize: 3, color: 'textSecondary' }}>Mainnet Polling Contract</Text>
          <Text variant="h2" sx={{ fontSize: 3 }}>
            {pollingAddress ? (
              <EtherscanLink hash={pollingAddress} type="address" network={network} showAddress />
            ) : (
              <Box sx={{ width: 6 }}>
                <Skeleton />
              </Box>
            )}
          </Text>
        </Flex>
      );
    },

    'arbitrum polling contract': key => {
      const pollingAddress = ArbitrumPollingAddressMap[network];
      const arbitrumNetwork =
        network === SupportedNetworks.MAINNET
          ? SupportedNetworks.ARBITRUM
          : SupportedNetworks.ARBITRUMTESTNET;

      return (
        <Flex key={key} sx={{ justifyContent: 'space-between', flexDirection: 'row' }}>
          <Text sx={{ fontSize: 3, color: 'textSecondary' }}>Arbitrum Polling Contract</Text>
          <Text variant="h2" sx={{ fontSize: 3 }}>
            {pollingAddress ? (
              <EtherscanLink showAddress type="address" network={arbitrumNetwork} hash={pollingAddress} />
            ) : (
              <Box sx={{ width: 6 }}>
                <Skeleton />
              </Box>
            )}
          </Text>
        </Flex>
      );
    },

    'sky needed to pass': key => {
      const { data: mkrOnHat } = useMkrOnHat();

      return (
        <Flex key={key} sx={{ justifyContent: 'space-between', flexDirection: 'row' }}>
          <Text sx={{ fontSize: 3, color: 'textSecondary' }}>SKY on Governing Proposal</Text>
          <Text variant="h2" sx={{ fontSize: 3 }}>
            {mkrOnHat ? (
              `${formatValue(mkrOnHat)} SKY`
            ) : (
              <Box sx={{ width: 6 }}>
                <Skeleton />
              </Box>
            )}
          </Text>
        </Flex>
      );
    },

    'savings rate': key => {
      const { data: daiSavingsRate } = useDaiSavingsRate();

      return (
        <Flex key={key} sx={{ justifyContent: 'space-between', flexDirection: 'row' }}>
          <Text sx={{ fontSize: 3, color: 'textSecondary' }}>Dai Savings Rate</Text>
          <Text variant="h2" sx={{ fontSize: 3 }}>
            {daiSavingsRate ? (
              `${daiSavingsRate.toFixed(2)}%`
            ) : (
              <Box sx={{ width: 6 }}>
                <Skeleton />
              </Box>
            )}
          </Text>
        </Flex>
      );
    },

    'total dai': key => {
      const { data: totalDai } = useTotalDai();

      return (
        <Flex key={key} sx={{ justifyContent: 'space-between', flexDirection: 'row' }}>
          <Text sx={{ fontSize: 3, color: 'textSecondary' }}>Total Dai</Text>
          <Text variant="h2" sx={{ fontSize: 3 }}>
            {totalDai ? (
              `${formatValue(totalDai, 'rad')} DAI`
            ) : (
              <Box sx={{ width: 6 }}>
                <Skeleton />
              </Box>
            )}
          </Text>
        </Flex>
      );
    },

    'debt ceiling': key => {
      const { data: debtCeiling } = useSystemWideDebtCeiling();

      return (
        <Flex key={key} sx={{ justifyContent: 'space-between', flexDirection: 'row' }}>
          <Text sx={{ fontSize: 3, color: 'textSecondary' }}>Dai Debt Ceiling</Text>
          <Text variant="h2" sx={{ fontSize: 3 }}>
            {debtCeiling ? (
              `${formatValue(debtCeiling, 'rad')} DAI`
            ) : (
              <Box sx={{ width: 6 }}>
                <Skeleton />
              </Box>
            )}
          </Text>
        </Flex>
      );
    },

    'system surplus': key => {
      const { data: systemSurplus } = useSystemSurplus();

      return (
        <Flex key={key} sx={{ justifyContent: 'space-between', flexDirection: 'row', mt: 2 }}>
          <Text sx={{ fontSize: 3, color: 'textSecondary' }}>System Surplus</Text>
          <Text variant="h2" sx={{ fontSize: 3 }}>
            {systemSurplus ? (
              `${formatValue(systemSurplus, 'rad')} DAI`
            ) : (
              <Box sx={{ width: 6 }}>
                <Skeleton />
              </Box>
            )}
          </Text>
        </Flex>
      );
    }
  };

  return (
    <Box sx={{ display: ['none', 'block'] }} className={className}>
      <Flex sx={{ flexDirection: 'row', justifyContent: 'space-between', mb: 2, mt: 3 }}>
        <Heading as="h3" variant="microHeading">
          System Info
        </Heading>
        <ExternalLink
          href="https://daistats.com/"
          target="_blank"
          sx={{ color: 'text', fontSize: 3, ':hover': { color: 'accentBlueEmphasis' } }}
        >
          <Flex sx={{ alignItems: 'center' }}>
            <Text>
              See more
              <Icon sx={{ ml: 2 }} name="arrowTopRight" size={2} />
            </Text>
          </Flex>
        </ExternalLink>
      </Flex>
      <Card variant="compact">
        <Stack gap={3}>{fields.map(field => statsMap[field](field))}</Stack>
      </Card>
    </Box>
  );
}
