/** @jsx jsx */
import { Card, Flex, Link as ExternalLink, Text, Box, Grid, Heading, jsx } from 'theme-ui';
import { Icon } from '@makerdao/dai-ui-icons';
import useSWR, { mutate } from 'swr';
import Skeleton from 'react-loading-skeleton';
import getMaker, { DAI } from '../../../lib/maker';
import { bigNumberKFormat } from '../../../lib/utils';
import CurrencyObject from '../../../types/currency';

async function getSystemStats(): Promise<CurrencyObject[]> {
  const maker = await getMaker();
  return Promise.all([
    maker.service('mcd:savings').getYearlyRate(),
    maker.service('mcd:systemData').getSystemSurplus(),
    maker.service('mcd:systemData').getTotalDai(),
    // @ts-ignore
    DAI(await maker.service('mcd:systemData').getSystemWideDebtCeiling())
  ]);
}

// if we are on the browser, trigger a prefetch as soon as possible
if (typeof window !== 'undefined') {
  getSystemStats().then(stats => {
    mutate('/system-stats', stats, false);
  });
}

export default function (props): JSX.Element {
  const { data } = useSWR<CurrencyObject[]>('/system-stats', getSystemStats);
  const [savingsRate, systemSurplus, totalDai, debtCeiling] = data || [];

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
          <Flex sx={{ justifyContent: 'space-between', flexDirection: 'row' }}>
            <Text sx={{ fontSize: 3, color: 'text' }}>Dai Savings Rate</Text>
            <Text variant="h2" sx={{ fontSize: 3 }}>
              {data ? `${savingsRate.toFixed(2)}%` : <Skeleton />}
            </Text>
          </Flex>
          {/* <Flex sx={{ justifyContent: 'space-between', flexDirection: 'row' }}>
            <Text sx={{ fontSize: 3, color: 'text' }}>DSR Spread</Text>
            <Text variant="h2" sx={{ fontSize: 3 }}>
              {data ? `${savingsRate.toFixed(2)}%` : <Skeleton />}
            </Text>
          </Flex> */}
          <Flex sx={{ justifyContent: 'space-between', flexDirection: 'row', mt: 2 }}>
            <Text sx={{ fontSize: 3, color: 'text' }}>Total Dai</Text>
            <Text variant="h2" sx={{ fontSize: 3 }}>
              {data ? `${bigNumberKFormat(totalDai)} DAI` : <Skeleton />}
            </Text>
          </Flex>
          <Flex sx={{ justifyContent: 'space-between', flexDirection: 'row', mt: 2 }}>
            <Text sx={{ fontSize: 3, color: 'text' }}>Dai Debt Ceiling</Text>
            <Text variant="h2" sx={{ fontSize: 3 }}>
              {data ? `${bigNumberKFormat(debtCeiling)} DAI` : <Skeleton />}
            </Text>
          </Flex>
          <Flex sx={{ justifyContent: 'space-between', flexDirection: 'row', mt: 2 }}>
            <Text sx={{ fontSize: 3, color: 'text' }}>System Surplus</Text>
            <Text variant="h2" sx={{ fontSize: 3 }}>
              {data ? `${systemSurplus.toBigNumber().toFormat(0)} DAI` : <Skeleton />}
            </Text>
          </Flex>
        </Card>
      </Box>
    </>
  );
}
