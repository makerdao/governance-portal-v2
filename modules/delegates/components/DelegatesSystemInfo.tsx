import BigNumber from 'lib/bigNumberJs';
import StackLayout from 'modules/app/components/layout/layouts/Stack';
import SkeletonThemed from 'modules/app/components/SkeletonThemed';
import { formatAddress } from 'lib/utils';
import { Box, Card, Flex, Heading, Text } from 'theme-ui';
import { ExternalLink } from 'modules/app/components/ExternalLink';
import { DelegatesAPIStats } from '../types';
import { useContractAddress } from 'modules/web3/hooks/useContractAddress';
import { useTotalSupply } from 'modules/web3/hooks/useTotalSupply';
import { BigNumberWAD } from 'modules/web3/constants/numbers';
import { getEtherscanLink } from 'modules/web3/helpers/getEtherscanLink';
import { useActiveWeb3React } from 'modules/web3/hooks/useActiveWeb3React';
import { Tokens } from 'modules/web3/constants/tokens';

export function DelegatesSystemInfo({
  stats,
  className
}: {
  stats: DelegatesAPIStats;
  className?: string;
}): React.ReactElement {
  const delegateFactoryAddress = useContractAddress('voteDelegateFactory');
  const { network } = useActiveWeb3React();

  const { data: totalMkr } = useTotalSupply(Tokens.MKR);

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
      value: new BigNumber(stats.totalMKRDelegated).toFormat(0)
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
    },
    {
      title: 'Total Delegators',
      id: 'total-delegators-system-info',
      value: stats.totalDelegators
    }
  ];

  return (
    <Box sx={{ mt: 3 }}>
      <Heading mt={3} mb={2} as="h3" variant="microHeading">
        System Info
      </Heading>
      <Card variant="compact">
        <StackLayout gap={3}>
          <Flex sx={{ justifyContent: 'space-between', flexDirection: 'row' }}>
            <Text sx={{ fontSize: 3, color: 'textSecondary' }}>Delegate Factory</Text>
            {delegateFactoryAddress ? (
              <ExternalLink
                href={getEtherscanLink(network, delegateFactoryAddress, 'address')}
                title="View address on Etherscan"
              >
                <Text>{formatAddress(delegateFactoryAddress)}</Text>
              </ExternalLink>
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
