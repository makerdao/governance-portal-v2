import { Flex, Link as ExternalLink, Text, Box, Grid } from 'theme-ui';
import { Icon } from '@makerdao/dai-ui-icons';
import useSWR, { mutate } from 'swr';
import Skeleton from 'react-loading-skeleton';
import getMaker, { DAI } from '../../lib/maker';
import { bigNumberKFormat } from '../../lib/utils';
import CurrenctObject from '../../types/currency';

async function getSystemStats(): Promise<CurrenctObject[]> {
  const maker = await getMaker();
  return Promise.all([
    maker.service('mcd:savings').getYearlyRate(),
    maker.service('mcd:systemData').getSystemSurplus(),
    maker.getToken(DAI).totalSupply(),
    DAI(await maker.service('mcd:systemData').getSystemWideDebtCeiling())
  ]);
}

// if we are on the browser, trigger a prefetch as soon as possible
if (typeof window !== 'undefined') {
  getSystemStats().then(stats => {
    mutate('/system-stats', stats, false);
  });
}

export default function() {
  const { data } = useSWR<CurrenctObject[]>(`/system-stats`, getSystemStats);
  const [savingsRate, systemSurplus, totalDaiSupply, debtCeiling] = data || [];

  return (
    <>
      {/* Desktop */}
      <Box sx={{ display: ['none', 'block'] }}>
        <Flex sx={{ justifyContent: 'space-between', alignItems: 'center' }}>
          <ExternalLink href="https://daistats.com/" target="_blank">
            <Flex sx={{ alignItems: 'center' }}>
              <Text sx={{ color: 'mutedAlt', fontSize: 3 }}>
                View more stats
                <Icon ml="2" name="chevron_right" size="2" sx={{ color: 'mutedAlt' }} />
              </Text>
            </Flex>
          </ExternalLink>
        </Flex>

        <Flex mx="auto" variant="cards.primary" sx={{ boxShadow: 'faint', height: '133px' }}>
          <Flex mx="4" my="auto" sx={{ width: '100%', justifyContent: 'space-between' }}>
            <div>
              <Text sx={{ fontSize: 3, color: 'mutedAlt' }}>Dai Savings Rate</Text>
              <Text mt="2" variant="h2">
                {data ? `${savingsRate.toFixed(2)}%` : <Skeleton />}
              </Text>
            </div>

            <div>
              <Text sx={{ fontSize: 3, color: 'mutedAlt' }}>Total Dai</Text>
              <Text mt="2" variant="h2">
                {data ? `${bigNumberKFormat(totalDaiSupply)} DAI` : <Skeleton />}
              </Text>
            </div>
            <div>
              <Text sx={{ fontSize: 3, color: 'mutedAlt' }}>Dai Debt Celing</Text>
              <Text mt="2" variant="h2">
                {data ? `${bigNumberKFormat(debtCeiling)} DAI` : <Skeleton />}
              </Text>
            </div>
            <div>
              <Text sx={{ fontSize: 3, color: 'mutedAlt' }}>System Surplus</Text>
              <Text mt="2" variant="h2">
                {data ? `${systemSurplus.toBigNumber().toFormat(0)} DAI` : <Skeleton />}
              </Text>
            </div>
          </Flex>
        </Flex>
      </Box>

      {/* Mobile */}
      <Box sx={{ display: ['block', 'none'] }}>

        <Grid mx="auto" variant="cards.primary" sx={{ boxShadow: 'faint' }}>
          <Flex sx={{ flexDirection: 'row', justifyContent: 'space-between'}}>
            <Text sx={{ fontSize: 4, fontWeight: 'bold', color: 'primaryText' }}>System Stats</Text>
              <Text
                sx={{ color: 'mutedAlt', fontSize: 3 }}
              >
                See all stats
                <Icon name="chevron_right" color="#708390" size="2" sx={{ marginLeft: 10 }} />
              </Text>
          </Flex>

          {/* Add DSR spread */}

          <Flex sx={{ flexDirection: 'row', justifyContent: 'space-between' }}>
            <Text sx={{ fontSize: 3, color: 'mutedAlt' }}>Dai Savings Rate</Text>
            <Text sx={{ fontSize: 3, color: 'primaryText' }}>
              {data ? `${savingsRate.toFixed(2)}%` : <Skeleton />}
            </Text>
          </Flex>

          <Flex sx={{ flexDirection: 'row', justifyContent: 'space-between' }}>
            <Text sx={{ fontSize: 3, color: 'mutedAlt' }}>Total Dai</Text>
            <Text sx={{ fontSize: 3, color: 'primaryText' }}>
              {data ? `${bigNumberKFormat(totalDaiSupply)} DAI` : <Skeleton />}
            </Text>
          </Flex>
          <Flex sx={{ flexDirection: 'row', justifyContent: 'space-between' }}>
            <Text sx={{ fontSize: 3, color: 'mutedAlt' }}>Dai Debt Celing</Text>
            <Text sx={{ fontSize: 3, color: 'primaryText' }}>
              {data ? `${bigNumberKFormat(debtCeiling)} DAI` : <Skeleton />}
            </Text>
          </Flex>
          <Flex sx={{ flexDirection: 'row', justifyContent: 'space-between' }}>
            <Text sx={{ fontSize: 3, color: 'mutedAlt' }}>System Surplus</Text>
            <Text sx={{ fontSize: 3, color: 'primaryText' }}>
              {data ? `${systemSurplus.toBigNumber().toFormat(0)} DAI` : <Skeleton />}
            </Text>
          </Flex>
        </Grid>
      </Box>
    </>
  );
}
