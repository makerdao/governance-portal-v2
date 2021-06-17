/** @jsx jsx */
import { Flex, Link as ExternalLink, Text, Box, Grid, jsx } from 'theme-ui';
import { Icon } from '@makerdao/dai-ui-icons';
import useSWR, { mutate } from 'swr';
import Skeleton from 'react-loading-skeleton';
import getMaker, { DAI } from '../../lib/maker';
import { CurrencyObject } from 'types/currency';
import BigNumber from 'bignumber.js';

async function getSystemStats(): Promise<[BigNumber, CurrencyObject, CurrencyObject, CurrencyObject]> {
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

export default function SystemStats(): JSX.Element {
  const { data } = useSWR<[BigNumber, CurrencyObject, CurrencyObject, CurrencyObject]>(
    '/system-stats-index',
    getSystemStats
  );
  const [savingsRate, systemSurplus, totalDai, debtCeiling] = data || [];
  return (
    <>
      {/* Desktop */}
      <Box sx={{ display: ['none', 'block'] }}>
        <Flex sx={{ justifyContent: 'space-between', alignItems: 'center', mb: 3, mx: 'auto' }}>
          <Text sx={{ fontSize: [4, 5], fontWeight: '500' }}>System stats</Text>
          <ExternalLink href="https://daistats.com/" target="_blank">
            <Flex sx={{ alignItems: 'center' }}>
              <Text
                sx={{
                  color: 'accentBlue',
                  fontSize: [2, 3],
                  fontWeight: '500',
                  ':hover': { color: 'blueLinkHover' }
                }}
              >
                View more stats
                <Icon ml={2} name="arrowTopRight" size="2" />
              </Text>
            </Flex>
          </ExternalLink>
        </Flex>

        <Flex sx={{ mx: 0, px: 5, py: 3, backgroundColor: 'background', borderRadius: 'small' }}>
          <Flex m={3} sx={{ width: '100%', justifyContent: 'space-between' }}>
            <div>
              <Text sx={{ fontSize: 3, color: 'textSecondary' }}>Dai Savings Rate</Text>
              <Text mt={2} sx={{ fontSize: 5 }}>
                {savingsRate ? `${savingsRate.multipliedBy(100).toFixed(2)}%` : <Skeleton />}
              </Text>
            </div>

            <div>
              <Text sx={{ fontSize: 3, color: 'textSecondary' }}>Total Dai</Text>
              <Text mt={2} sx={{ fontSize: 5 }}>
                {totalDai ? `${totalDai.toBigNumber().toFormat(0)} DAI` : <Skeleton />}
              </Text>
            </div>
            <div>
              <Text sx={{ fontSize: 3, color: 'textSecondary' }}>Dai Debt Ceiling</Text>
              <Text mt={2} sx={{ fontSize: 5 }}>
                {debtCeiling ? `${debtCeiling.toBigNumber().toFormat(0)} DAI` : <Skeleton />}
              </Text>
            </div>
            <div>
              <Text sx={{ fontSize: 3, color: 'textSecondary' }}>System Surplus</Text>
              <Text mt={2} sx={{ fontSize: 5 }}>
                {systemSurplus ? `${systemSurplus.toBigNumber().toFormat(0)} DAI` : <Skeleton />}
              </Text>
            </div>
          </Flex>
        </Flex>
      </Box>

      {/* Mobile */}
      <Box sx={{ display: ['block', 'none'], backgroundColor: 'background', p: 2 }}>
        <Grid sx={{ p: 3 }}>
          <Flex sx={{ flexDirection: 'row', justifyContent: 'space-between' }}>
            <Text sx={{ fontSize: 3, fontWeight: '500', color: 'text' }}>System Stats</Text>
            <ExternalLink href="https://daistats.com/" target="_blank">
              <Flex sx={{ alignItems: 'center' }}>
                <Text sx={{ color: 'accentBlue', fontSize: 3 }}>
                  View more
                  <Icon ml="2" name="arrowTopRight" size="2" />
                </Text>
              </Flex>
            </ExternalLink>
          </Flex>

          <Flex sx={{ flexDirection: 'row', justifyContent: 'space-between' }}>
            <Text sx={{ fontSize: 2, color: 'textSecondary' }}>Dai Savings Rate</Text>
            <Text sx={{ fontSize: 2 }}>
              {data ? `${savingsRate?.multipliedBy(100).toFixed(2)}%` : <Skeleton />}
            </Text>
          </Flex>

          <Flex sx={{ flexDirection: 'row', justifyContent: 'space-between' }}>
            <Text sx={{ fontSize: 2, color: 'textSecondary' }}>Total Dai</Text>
            <Text sx={{ fontSize: 2 }}>
              {totalDai ? `${totalDai.toBigNumber().toFormat(0)} DAI` : <Skeleton />}
            </Text>
          </Flex>
          <Flex sx={{ flexDirection: 'row', justifyContent: 'space-between' }}>
            <Text sx={{ fontSize: 2, color: 'textSecondary' }}>Dai Debt Ceiling</Text>
            <Text sx={{ fontSize: 2 }}>
              {debtCeiling ? `${debtCeiling.toBigNumber().toFormat(0)} DAI` : <Skeleton />}
            </Text>
          </Flex>
          <Flex sx={{ flexDirection: 'row', justifyContent: 'space-between' }}>
            <Text sx={{ fontSize: 2, color: 'textSecondary' }}>System Surplus</Text>
            <Text sx={{ fontSize: 2 }}>
              {systemSurplus ? `${systemSurplus.toBigNumber().toFormat(0)} DAI` : <Skeleton />}
            </Text>
          </Flex>
        </Grid>
      </Box>
    </>
  );
}
