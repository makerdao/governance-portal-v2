import { Flex, Link as ExternalLink, Text, Box, Grid } from 'theme-ui';
import { Icon } from '@makerdao/dai-ui-icons';
import Skeleton from 'modules/app/components/SkeletonThemed';
import { useTotalDai } from 'modules/web3/hooks/useTotalDai';
import { useDaiSavingsRate } from 'modules/web3/hooks/useDaiSavingsRate';
import { useSystemSurplus } from 'modules/web3/hooks/useSystemSurplus';
import { useSystemWideDebtCeiling } from 'modules/web3/hooks/useSystemWideDebtCeiling';
import { formatValue } from 'lib/string';

export default function SystemStats(): JSX.Element {
  const { data: totalDai } = useTotalDai();
  const { data: daiSavingsRate } = useDaiSavingsRate();
  const { data: systemSurplus } = useSystemSurplus();
  const { data: debtCeiling } = useSystemWideDebtCeiling();

  const infoUnits = [
    {
      title: 'Dai Savings Rate',
      value: daiSavingsRate ? `${daiSavingsRate.toFixed(2)}%` : <Skeleton />
    },
    {
      title: 'Total Dai',
      value: totalDai ? `${formatValue(totalDai, 'rad')} DAI` : <Skeleton />
    },
    {
      title: 'Dai Debt Ceiling',
      value: debtCeiling ? `${formatValue(debtCeiling, 'rad')} DAI` : <Skeleton />
    },
    {
      title: 'System Surplus',
      value: systemSurplus ? `${formatValue(systemSurplus, 'rad')} DAI` : <Skeleton />
    }
  ];
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
            {infoUnits.map(unit => (
              <Box key={unit.title} data-testid={unit.title}>
                <Box>
                  <Text sx={{ fontSize: 3, color: 'textSecondary' }}>{unit.title}</Text>
                </Box>
                <Box mt={2} data-testid={`${unit.title}-value`}>
                  <Text sx={{ fontSize: 5 }}>{unit.value}</Text>
                </Box>
              </Box>
            ))}
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

          {infoUnits.map(unit => (
            <Flex key={`${unit.title}-mobile`} sx={{ flexDirection: 'row', justifyContent: 'space-between' }}>
              <Text sx={{ fontSize: 2, color: 'textSecondary' }}>{unit.title}</Text>
              <Text sx={{ fontSize: 2 }}>{unit.value}</Text>
            </Flex>
          ))}
        </Grid>
      </Box>
    </>
  );
}
