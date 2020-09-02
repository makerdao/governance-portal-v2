/** @jsx jsx */
import { Flex, Link as ExternalLink, Text, Box, Grid, jsx } from 'theme-ui';
import { Icon } from '@makerdao/dai-ui-icons';
import useSWR, { mutate } from 'swr';
import Skeleton from 'react-loading-skeleton';
import getMaker, { DAI } from '../../lib/maker';
import { bigNumberKFormat } from '../../lib/utils';
import CurrencyObject from '../../types/currency';

async function getSystemStats(): Promise<CurrencyObject[]> {
  const maker = await getMaker();
  return Promise.all([
    maker.service('mcd:savings').getYearlyRate(),
    maker.service('mcd:systemData').getSystemSurplus(),
    maker.service('mcd:systemData').getTotalDai(),
    DAI(await maker.service('mcd:systemData').getSystemWideDebtCeiling())
  ]);
}

// if we are on the browser, trigger a prefetch as soon as possible
if (typeof window !== 'undefined') {
  getSystemStats().then(stats => {
    mutate('/system-stats', stats, false);
  });
}

export default function (): JSX.Element {
  const { data } = useSWR<CurrencyObject[]>('/system-stats', getSystemStats);
  const [savingsRate, systemSurplus, totalDai, debtCeiling] = data || [];

  return (
    <>
      {/* Desktop */}
      <Box sx={{ display: ['none', 'block'] }}>
        <Flex sx={{ justifyContent: 'space-between', alignItems: 'center', mb: 3, mx: 'auto' }}>
          <Text sx={{ fontSize: 5 }}>System stats</Text>
          <ExternalLink href="https://daistats.com/" target="_blank">
            <Flex sx={{ alignItems: 'center' }}>
              <Text sx={{ color: 'accentBlue', fontSize: 3 }}>
                View more stats
                <Icon ml={2} name="arrowTopRight" size="2" />
              </Text>
            </Flex>
          </ExternalLink>
        </Flex>

        <Flex sx={{ mx: 0, px: 5, py: 4, backgroundColor: 'background', borderRadius: 'small' }}>
          <Flex m={3} sx={{ width: '100%', justifyContent: 'space-between' }}>
            <div>
              <Text sx={{ fontSize: 3, color: 'mutedAlt' }}>Dai Savings Rate</Text>
              <Text mt={3} variant="h2" sx={{ fontSize: 5 }}>
                {data ? `${savingsRate.toFixed(2)}%` : <Skeleton />}
              </Text>
            </div>

            <div>
              <Text sx={{ fontSize: 3, color: 'mutedAlt' }}>Total Dai</Text>
              <Text mt={3} variant="h2" sx={{ fontSize: 5 }}>
                {data ? `${bigNumberKFormat(totalDai)} DAI` : <Skeleton />}
              </Text>
            </div>
            <div>
              <Text sx={{ fontSize: 3, color: 'mutedAlt' }}>Dai Debt Ceiling</Text>
              <Text mt={3} variant="h2" sx={{ fontSize: 5 }}>
                {data ? `${bigNumberKFormat(debtCeiling)} DAI` : <Skeleton />}
              </Text>
            </div>
            <div>
              <Text sx={{ fontSize: 3, color: 'mutedAlt' }}>System Surplus</Text>
              <Text mt={3} variant="h2" sx={{ fontSize: 5 }}>
                {data ? `${systemSurplus.toBigNumber().toFormat(0)} DAI` : <Skeleton />}
              </Text>
            </div>
          </Flex>
        </Flex>
      </Box>

      {/* Mobile */}
      <Box sx={{ display: ['block', 'none'], backgroundColor: 'background', p: 0 }}>
        <Grid sx={{ p: 4 }}>
          <Flex sx={{ flexDirection: 'row', justifyContent: 'space-between' }}>
            <Text sx={{ fontSize: 4, fontWeight: 'bold', color: 'text' }}>System Stats</Text>
            <ExternalLink href="https://daistats.com/" target="_blank">
              <Flex sx={{ alignItems: 'center' }}>
                <Text sx={{ color: 'accentBlue', fontSize: 3 }}>
                  View more stats
                  <Icon ml="2" name="arrowTopRight" size="2" />
                </Text>
              </Flex>
            </ExternalLink>
          </Flex>

          <Flex sx={{ flexDirection: 'row', justifyContent: 'space-between' }}>
            <Text sx={{ fontSize: 3, color: 'mutedAlt' }}>Dai Savings Rate</Text>
            <Text sx={{ fontSize: 3 }}>{data ? `${savingsRate.toFixed(2)}%` : <Skeleton />}</Text>
          </Flex>

          <Flex sx={{ flexDirection: 'row', justifyContent: 'space-between' }}>
            <Text sx={{ fontSize: 3, color: 'mutedAlt' }}>Total Dai</Text>
            <Text sx={{ fontSize: 3 }}>{data ? `${bigNumberKFormat(totalDai)} DAI` : <Skeleton />}</Text>
          </Flex>
          <Flex sx={{ flexDirection: 'row', justifyContent: 'space-between' }}>
            <Text sx={{ fontSize: 3, color: 'mutedAlt' }}>Dai Debt Ceiling</Text>
            <Text sx={{ fontSize: 3 }}>{data ? `${bigNumberKFormat(debtCeiling)} DAI` : <Skeleton />}</Text>
          </Flex>
          <Flex sx={{ flexDirection: 'row', justifyContent: 'space-between' }}>
            <Text sx={{ fontSize: 3, color: 'mutedAlt' }}>System Surplus</Text>
            <Text sx={{ fontSize: 3 }}>
              {data ? `${systemSurplus.toBigNumber().toFormat(0)} DAI` : <Skeleton />}
            </Text>
          </Flex>
        </Grid>
      </Box>
    </>
  );
}
