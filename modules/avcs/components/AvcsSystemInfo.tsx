/*

SPDX-FileCopyrightText: © 2023 Dai Foundation <www.daifoundation.org>

SPDX-License-Identifier: AGPL-3.0-or-later

*/

import { useContractAddress } from 'modules/web3/hooks/useContractAddress';
import { useWeb3 } from 'modules/web3/hooks/useWeb3';
import { AvcsPageStats } from '../types/avc';
import useSWR from 'swr';
import { DelegatesAPIResponse } from 'modules/delegates/types';
import { fetchJson } from 'lib/fetchJson';
import BigNumber from 'lib/bigNumberJs';
import SkeletonThemed from 'modules/app/components/SkeletonThemed';
import { useTotalSupply } from 'modules/web3/hooks/useTotalSupply';
import { Tokens } from 'modules/web3/constants/tokens';
import { BigNumberWAD } from 'modules/web3/constants/numbers';
import { Box, Card, Flex, Heading, Text } from 'theme-ui';
import StackLayout from 'modules/app/components/layout/layouts/Stack';
import EtherscanLink from 'modules/web3/components/EtherscanLink';

export function AvcsSystemInfo({ stats }: { stats: AvcsPageStats }): React.ReactElement {
  const delegateFactoryAddress = useContractAddress('voteDelegateFactory');
  const { network } = useWeb3();

  const { data: delegatesData } = useSWR<DelegatesAPIResponse>(
    `/api/delegates/v2?network=${network}`,
    fetchJson,
    {
      revalidateOnFocus: false,
      refreshInterval: 0,
      revalidateOnMount: true
    }
  );

  const { data: totalMkr } = useTotalSupply(Tokens.MKR);

  const statsItems = [
    {
      title: 'Delegate Factory',
      id: 'delegate-factory-system-info',
      value: delegateFactoryAddress ? (
        <EtherscanLink type="address" showAddress hash={delegateFactoryAddress} network={network} />
      ) : (
        <SkeletonThemed width={'100px'} height={'15px'} />
      )
    },
    {
      title: 'Total AVCs',
      id: 'total-avcs-system-info',
      value: stats.totalCount
    },
    {
      title: 'Total delegates',
      id: 'total-delegates-system-info',
      value: delegatesData ? delegatesData?.stats.total : <SkeletonThemed width={'100px'} height={'15px'} />
    },
    {
      title: 'Aligned delegates',
      id: 'total-aligned-delegates-system-info',
      value: delegatesData ? delegatesData.stats.aligned : <SkeletonThemed width={'100px'} height={'15px'} />
    },
    {
      title: 'Shadow delegates',
      id: 'total-shadow-delegates-system-info',
      value: delegatesData ? delegatesData.stats.shadow : <SkeletonThemed width={'100px'} height={'15px'} />
    },
    {
      title: 'Total MKR delegated',
      id: 'total-mkr-system-info',
      value: delegatesData ? (
        new BigNumber(delegatesData.stats.totalMKRDelegated).toFormat(0)
      ) : (
        <SkeletonThemed width={'100px'} height={'15px'} />
      )
    },
    {
      title: 'Percent of MKR delegated',
      id: 'percent-mkr-system-info',
      value:
        totalMkr && delegatesData ? (
          `${new BigNumber(delegatesData.stats.totalMKRDelegated)
            .dividedBy(new BigNumber(totalMkr._hex).div(BigNumberWAD))
            .multipliedBy(100)
            .toFormat(2)}%`
        ) : (
          <SkeletonThemed width={'100px'} height={'15px'} />
        )
    },
    {
      title: 'Total Delegators',
      id: 'total-delegators-system-info',
      value: delegatesData ? (
        delegatesData.stats.totalDelegators
      ) : (
        <SkeletonThemed width={'100px'} height={'15px'} />
      )
    }
  ];

  return (
    <Box sx={{ mt: 3 }}>
      <Heading mt={3} mb={2} as="h3" variant="microHeading">
        System Info
      </Heading>
      <Card variant="compact">
        <StackLayout gap={3}>
          {statsItems.map(item => (
            <Flex key={item.id} sx={{ justifyContent: 'space-between', flexDirection: 'row' }}>
              <Text sx={{ fontSize: 3, color: 'textSecondary' }}>{item.title}</Text>
              <Text variant="h2" sx={{ fontSize: 3 }} data-testid={item.id}>
                {item.value}
              </Text>
            </Flex>
          ))}
        </StackLayout>
      </Card>
    </Box>
  );
}
