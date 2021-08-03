import StackLayout from 'components/layouts/Stack';
import SkeletonThemed from 'components/SkeletonThemed';
import getMaker, { getNetwork } from 'lib/maker';
import { formatAddress, getEtherscanLink } from 'lib/utils';
import useSWR from 'swr';
import { Box, Card, Flex, Heading, Link as ThemeUILink, Text } from 'theme-ui';
import { DelegatesAPIStats } from 'types/delegatesAPI';

export function DelegatesSystemInfo({ stats }: { stats: DelegatesAPIStats }): React.ReactElement {
  const { data: delegateFactoryAddress } = useSWR<string>('/delegate-factory-address', () =>
    getMaker().then(maker => maker.service('smartContract').getContract('VOTE_DELEGATE_FACTORY').address)
  );
  const statsItems = [
    {
      title: 'Total delegates',
      value: stats.total
    },
    {
      title: 'Recognized delegates',
      value: stats.recognized
    },
    {
      title: 'Shadow delegates',
      value: stats.shadow
    },
    {
      title: 'Total MKR delegated',
      value: stats.totalMKRDelegated
    }
  ];

  return (
    <Box>
      <Heading mt={3} mb={2} as="h3" variant="microHeading">
        Delegate System Info
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
            <Flex key={item.title} sx={{ justifyContent: 'space-between', flexDirection: 'row' }}>
              <Text sx={{ fontSize: 3, color: 'textSecondary' }}>{item.title}</Text>
              <Text variant="h2" sx={{ fontSize: 3 }}>
                {item.value}
              </Text>
            </Flex>
          ))}
        </StackLayout>
      </Card>
    </Box>
  );
}
