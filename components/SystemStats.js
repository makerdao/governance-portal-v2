import { Flex, Link as ExternalLink, Text } from 'theme-ui';
import { Icon } from '@makerdao/dai-ui-icons';
import useSWR, { mutate } from 'swr';
import Skeleton from 'react-loading-skeleton';
import getMaker, { DAI } from '../lib/maker';
import { bigNumberKFormat } from '../lib/utils';

async function getSystemStats() {
  const maker = await getMaker();
  return Promise.all([
    maker.service('mcd:savings').getYearlyRate(),
    maker.getToken(DAI).totalSupply(),
    maker.service('mcd:systemData').getSystemWideDebtCeiling()
  ]);
}

// if we are on the browser, trigger a prefetch as soon as possible
if (typeof window !== 'undefined') {
  getSystemStats().then(stats => {
    mutate('/system-stats', stats, false);
  });
}

export default function() {
  const { data } = useSWR(`/system-stats`, getSystemStats);
  const [savingsRate, totalDaiSupply, debtCeiling] = data || [];

  return (
    <>
      <Flex sx={{ justifyContent: 'space-between', alignItems: 'center' }}>
        <Text pb="2" sx={{ fontSize: 6 }}>
          System Stats
        </Text>
        <ExternalLink href="https://daistats.com/" target="_blank">
          <Flex sx={{ alignItems: 'center' }}>
            <Text sx={{ color: 'mutedAlt', fontSize: 3 }}>
              See all system stats
              <Icon
                ml="2"
                name="chevron_right"
                size="2"
                sx={{ color: 'mutedAlt' }}
              />
            </Text>
          </Flex>
        </ExternalLink>
      </Flex>

      <Flex
        mx="auto"
        variant="cards.primary"
        sx={{ boxShadow: 'faint', height: '133px' }}
      >
        <Flex
          mx="4"
          my="auto"
          sx={{ width: '100%', justifyContent: 'space-between' }}
        >
          <div>
            <Text sx={{ fontSize: 3, color: 'mutedAlt' }}>
              Dai Savings Rate
            </Text>
            <Text mt="2" variant="h2">
              {data ? `${savingsRate.toFixed(2)}%` : <Skeleton />}
            </Text>
          </div>
          <div>
            <Text sx={{ fontSize: 3, color: 'mutedAlt' }}>Total ERC20 Dai</Text>
            <Text mt="2" variant="h2">
              {data ? bigNumberKFormat(totalDaiSupply) : <Skeleton />}
            </Text>
          </div>
          <div>
            <Text sx={{ fontSize: 3, color: 'mutedAlt' }}>Dai Debt Celing</Text>
            <Text mt="2" variant="h2">
              {data ? debtCeiling.toLocaleString() : <Skeleton />}
            </Text>
          </div>
        </Flex>
      </Flex>
    </>
  );
}
