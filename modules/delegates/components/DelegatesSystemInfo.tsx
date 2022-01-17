import BigNumber from 'bignumber.js';
import StackLayout from 'modules/app/components/layout/layouts/Stack';
import SkeletonThemed from 'modules/app/components/SkeletonThemed';
import { getNetwork } from 'lib/maker';
import { formatAddress, getEtherscanLink } from 'lib/utils';
import { Box, Card, Flex, Heading, Link as ThemeUILink, Text } from 'theme-ui';
import { DelegatesAPIStats } from '../types';
import { useContractAddress } from 'modules/web3/hooks/useChiefContract';
import { useTotalSupply } from 'modules/web3/hooks/useTotalSupply';
import { BigNumberWAD } from 'modules/web3/web3.constants';

export function DelegatesSystemInfo({
  stats,
  className
}: {
  stats: DelegatesAPIStats;
  className?: string;
}): React.ReactElement {
  const delegateFactoryAddress = useContractAddress('voteDelegateFactory');

  const { data: totalMkr } = useTotalSupply('mkr');

  const statsItems = [
    {
      title: 'Total delegates',
      id: 'total-delegates-system-info',
      value: stats.total
    },
    {
      title: 'Recognized delegates',
      id: 'total-recognized-delegates-system-info',
      value: stats.recognized
    },
    {
      title: 'Shadow delegates',
      id: 'total-shadow-delegates-system-info',
      value: stats.shadow
    },
    {
      title: 'Total MKR delegated',
      id: 'total-mkr-system-info',
      value: new BigNumber(stats.totalMKRDelegated).toFormat(2)
    },
    {
      title: 'Percent of MKR delegated',
      id: 'percent-mkr-system-info',
      value: totalMkr ? (
        `${new BigNumber(stats.totalMKRDelegated)
          .dividedBy(new BigNumber(totalMkr._hex).div(BigNumberWAD))
          .multipliedBy(100)
          .toFormat(2)}%`
      ) : (
        <SkeletonThemed width={'100px'} height={'15px'} />
      )
    }
  ];

  return (
    <Box className={className}>
      <Heading mt={3} mb={2} as="h3" variant="microHeading">
        System Info
      </Heading>
      <Card variant="compact">
        <StackLayout gap={3}>
          <Flex sx={{ justifyContent: 'space-between', flexDirection: 'row' }}>
            <Text sx={{ fontSize: 3, color: 'textSecondary' }}>Delegate Factory</Text>
            {delegateFactoryAddress ? (
              <ThemeUILink
                href={getEtherscanLink(getNetwork(), delegateFactoryAddress, 'address')}
                target="_blank"
              >
                <Text>{formatAddress(delegateFactoryAddress)}</Text>
              </ThemeUILink>
            ) : (
              <Box sx={{ width: 6 }}>
                <SkeletonThemed />
              </Box>
            )}
          </Flex>
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
