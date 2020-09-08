/** @jsx jsx */
import { Card, Flex, Link as ExternalLink, Text, Box, Heading, jsx } from 'theme-ui';
import { Icon } from '@makerdao/dai-ui-icons';
import useSWR, { mutate } from 'swr';
import Skeleton from 'react-loading-skeleton';

import Stack from './layouts/Stack';
import getMaker, { DAI } from '../lib/maker';
import { bigNumberKFormat } from '../lib/utils';
import CurrencyObject from '../types/currency';

async function getSystemStats(): Promise<CurrencyObject[]> {
  const maker = await getMaker();
  const hat = await maker.service('chief').getHat();
  return Promise.all([
    maker.service('chief').getApprovalCount(hat),
    maker.service('mcd:savings').getYearlyRate(),
    maker.service('mcd:systemData').getTotalDai(),
    // @ts-ignore
    DAI(await maker.service('mcd:systemData').getSystemWideDebtCeiling()),
    maker.service('mcd:systemData').getSystemSurplus()
  ]);
}

// if we are on the browser, trigger a prefetch as soon as possible
if (typeof window !== 'undefined') {
  getSystemStats().then(stats => {
    mutate('/system-stats', stats, false);
  });
}

type StatField = 'mkr needed to pass' | 'savings rate' | 'total dai' | 'debt ceiling' | 'system surplus';

export default function ({ fields = [], ...props }: { fields: StatField[] }): JSX.Element {
  const { data } = useSWR<CurrencyObject[]>('/system-stats', getSystemStats);
  const [mkrOnHat, savingsRate, totalDai, debtCeiling, systemSurplus] = data || [];

  const statsMap = {
    'mkr needed to pass': (
      <Flex sx={{ justifyContent: 'space-between', flexDirection: 'row' }}>
        <Text sx={{ fontSize: 3, color: 'text' }}>MKR needed to pass</Text>
        <Text variant="h2" sx={{ fontSize: 3 }}>
          {data ? (
            `${mkrOnHat.toBigNumber().toFormat(2)} MKR`
          ) : (
            <Box sx={{ width: 5 }}>
              <Skeleton />
            </Box>
          )}
        </Text>
      </Flex>
    ),

    'savings rate': (
      <Flex sx={{ justifyContent: 'space-between', flexDirection: 'row' }}>
        <Text sx={{ fontSize: 3, color: 'text' }}>Dai Savings Rate</Text>
        <Text variant="h2" sx={{ fontSize: 3 }}>
          {data ? (
            `${savingsRate.toFixed(2)}%`
          ) : (
            <Box sx={{ width: 5 }}>
              <Skeleton />
            </Box>
          )}
        </Text>
      </Flex>
    ),

    'total dai': (
      <Flex sx={{ justifyContent: 'space-between', flexDirection: 'row' }}>
        <Text sx={{ fontSize: 3, color: 'text' }}>Total Dai</Text>
        <Text variant="h2" sx={{ fontSize: 3 }}>
          {data ? (
            `${bigNumberKFormat(totalDai)} DAI`
          ) : (
            <Box sx={{ width: 5 }}>
              <Skeleton />
            </Box>
          )}
        </Text>
      </Flex>
    ),

    'debt ceiling': (
      <Flex sx={{ justifyContent: 'space-between', flexDirection: 'row' }}>
        <Text sx={{ fontSize: 3, color: 'text' }}>Dai Debt Ceiling</Text>
        <Text variant="h2" sx={{ fontSize: 3 }}>
          {data ? (
            `${bigNumberKFormat(debtCeiling)} DAI`
          ) : (
            <Box sx={{ width: 5 }}>
              <Skeleton />
            </Box>
          )}
        </Text>
      </Flex>
    ),

    'system surplus': (
      <Flex sx={{ justifyContent: 'space-between', flexDirection: 'row', mt: 2 }}>
        <Text sx={{ fontSize: 3, color: 'text' }}>System Surplus</Text>
        <Text variant="h2" sx={{ fontSize: 3 }}>
          {data ? (
            `${systemSurplus.toBigNumber().toFormat(0)} DAI`
          ) : (
            <Box sx={{ width: 5 }}>
              <Skeleton />
            </Box>
          )}
        </Text>
      </Flex>
    )
  };

  return (
    <>
      <Box sx={{ display: ['none', 'block'] }} {...props}>
        <Flex sx={{ flexDirection: 'row', justifyContent: 'space-between', mb: 2 }}>
          <Heading as="h3" variant="microHeading">
            System Stats
          </Heading>
          <ExternalLink href="https://daistats.com/" target="_blank">
            <Flex sx={{ alignItems: 'center' }}>
              <Text sx={{ color: 'accentBlue', fontSize: 3 }}>
                See all stats
                <Icon ml={2} name="arrowTopRight" size={2} sx={{ color: 'accentBlue' }} />
              </Text>
            </Flex>
          </ExternalLink>
        </Flex>
        <Card variant="compact">
          <Stack gap={2}>{fields.map(field => statsMap[field])}</Stack>
        </Card>
      </Box>
    </>
  );
}
