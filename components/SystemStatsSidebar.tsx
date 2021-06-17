/** @jsx jsx */
import { Card, Flex, Link as ExternalLink, Text, Box, Heading, jsx } from 'theme-ui';
import { Icon } from '@makerdao/dai-ui-icons';
import useSWR, { mutate } from 'swr';
import Skeleton from 'react-loading-skeleton';

import Stack from './layouts/Stack';
import getMaker, { DAI, getNetwork } from '@lib/maker';
import { bigNumberKFormat, formatAddress, getEtherscanLink } from '@lib/utils';
import BigNumber from 'bignumber.js';
import { CurrencyObject } from 'types/currency';

async function getSystemStats(): Promise<
  [CurrencyObject, BigNumber, CurrencyObject, CurrencyObject, CurrencyObject]
> {
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

type StatField =
  | 'chief contract'
  | 'polling contract'
  | 'mkr needed to pass'
  | 'savings rate'
  | 'total dai'
  | 'debt ceiling'
  | 'system surplus';

export default function SystemStatsSidebar({ fields = [], ...props }: { fields: StatField[] }): JSX.Element {
  const { data } = useSWR<[CurrencyObject, BigNumber, CurrencyObject, CurrencyObject, CurrencyObject]>(
    '/system-stats-sidebar',
    getSystemStats
  );
  const { data: chiefAddress } = useSWR<string>('/chief-address', () =>
    getMaker().then(maker => maker.service('smartContract').getContract('MCD_ADM').address)
  );
  const { data: pollingAddress } = useSWR<string>('/polling-address', () =>
    getMaker().then(maker => maker.service('smartContract').getContract('POLLING').address)
  );

  const [mkrOnHat, savingsRate, totalDai, debtCeiling, systemSurplus] = data || [];

  const statsMap = {
    'chief contract': key => (
      <Flex key={key} sx={{ justifyContent: 'space-between', flexDirection: 'row' }}>
        <Text sx={{ fontSize: 3, color: 'textSecondary' }}>Chief Contract</Text>
        <Text variant="h2" sx={{ fontSize: 3 }}>
          {chiefAddress ? (
            <ExternalLink href={getEtherscanLink(getNetwork(), chiefAddress, 'address')} target="_blank">
              <Text>{formatAddress(chiefAddress)}</Text>
            </ExternalLink>
          ) : (
            <Box sx={{ width: 6 }}>
              <Skeleton />
            </Box>
          )}
        </Text>
      </Flex>
    ),

    'polling contract': key => (
      <Flex key={key} sx={{ justifyContent: 'space-between', flexDirection: 'row' }}>
        <Text sx={{ fontSize: 3, color: 'textSecondary' }}>Polling Contract</Text>
        <Text variant="h2" sx={{ fontSize: 3 }}>
          {pollingAddress ? (
            <ExternalLink href={getEtherscanLink(getNetwork(), pollingAddress, 'address')} target="_blank">
              <Text>{formatAddress(pollingAddress)}</Text>
            </ExternalLink>
          ) : (
            <Box sx={{ width: 6 }}>
              <Skeleton />
            </Box>
          )}
        </Text>
      </Flex>
    ),

    'mkr needed to pass': key => (
      <Flex key={key} sx={{ justifyContent: 'space-between', flexDirection: 'row' }}>
        <Text sx={{ fontSize: 3, color: 'textSecondary' }}>MKR needed to pass</Text>
        <Text variant="h2" sx={{ fontSize: 3 }}>
          {mkrOnHat ? (
            `${mkrOnHat.toBigNumber().toFormat(2)} MKR`
          ) : (
            <Box sx={{ width: 6 }}>
              <Skeleton />
            </Box>
          )}
        </Text>
      </Flex>
    ),

    'savings rate': key => (
      <Flex key={key} sx={{ justifyContent: 'space-between', flexDirection: 'row' }}>
        <Text sx={{ fontSize: 3, color: 'textSecondary' }}>Dai Savings Rate</Text>
        <Text variant="h2" sx={{ fontSize: 3 }}>
          {savingsRate ? (
            `${savingsRate.multipliedBy(100).toFixed(2)}%`
          ) : (
            <Box sx={{ width: 6 }}>
              <Skeleton />
            </Box>
          )}
        </Text>
      </Flex>
    ),

    'total dai': key => (
      <Flex key={key} sx={{ justifyContent: 'space-between', flexDirection: 'row' }}>
        <Text sx={{ fontSize: 3, color: 'textSecondary' }}>Total Dai</Text>
        <Text variant="h2" sx={{ fontSize: 3 }}>
          {totalDai ? (
            `${bigNumberKFormat(totalDai)} DAI`
          ) : (
            <Box sx={{ width: 6 }}>
              <Skeleton />
            </Box>
          )}
        </Text>
      </Flex>
    ),

    'debt ceiling': key => (
      <Flex key={key} sx={{ justifyContent: 'space-between', flexDirection: 'row' }}>
        <Text sx={{ fontSize: 3, color: 'textSecondary' }}>Dai Debt Ceiling</Text>
        <Text variant="h2" sx={{ fontSize: 3 }}>
          {debtCeiling ? (
            `${bigNumberKFormat(debtCeiling)} DAI`
          ) : (
            <Box sx={{ width: 6 }}>
              <Skeleton />
            </Box>
          )}
        </Text>
      </Flex>
    ),

    'system surplus': key => (
      <Flex key={key} sx={{ justifyContent: 'space-between', flexDirection: 'row', mt: 2 }}>
        <Text sx={{ fontSize: 3, color: 'textSecondary' }}>System Surplus</Text>
        <Text variant="h2" sx={{ fontSize: 3 }}>
          {systemSurplus ? (
            `${systemSurplus.toBigNumber().toFormat(0)} DAI`
          ) : (
            <Box sx={{ width: 6 }}>
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
        <Flex sx={{ flexDirection: 'row', justifyContent: 'space-between', mb: 2, mt: 4 }}>
          <Heading as="h3" variant="microHeading">
            System Info
          </Heading>
          <ExternalLink
            href="https://daistats.com/"
            target="_blank"
            sx={{ color: 'accentBlue', fontSize: 3, ':hover': { color: 'blueLinkHover' } }}
          >
            <Flex sx={{ alignItems: 'center' }}>
              <Text>
                See more
                <Icon ml={2} name="arrowTopRight" size={2} />
              </Text>
            </Flex>
          </ExternalLink>
        </Flex>
        <Card variant="compact">
          <Stack gap={3}>{fields.map(field => statsMap[field](field))}</Stack>
        </Card>
      </Box>
    </>
  );
}
