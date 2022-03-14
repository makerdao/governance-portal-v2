import { Card, Flex, Link as ExternalLink, Text, Box, Heading } from 'theme-ui';
import { Icon } from '@makerdao/dai-ui-icons';
import Skeleton from 'modules/app/components/SkeletonThemed';
import Stack from './layout/layouts/Stack';
import { formatAddress } from 'lib/utils';
import { useSystemWideDebtCeiling } from 'modules/web3/hooks/useSystemWideDebtCeiling';
import { useSystemSurplus } from 'modules/web3/hooks/useSystemSurplus';
import { useTotalDai } from 'modules/web3/hooks/useTotalDai';
import { useDaiSavingsRate } from 'modules/web3/hooks/useDaiSavingsRate';
import { useTokenBalance } from 'modules/web3/hooks/useTokenBalance';
import { useMkrOnHat } from 'modules/executive/hooks/useMkrOnHat';
import { formatValue } from 'lib/string';
import { useContractAddress } from 'modules/web3/hooks/useContractAddress';
import { getEtherscanLink } from 'modules/web3/helpers/getEtherscanLink';
import { useActiveWeb3React } from 'modules/web3/hooks/useActiveWeb3React';
import { Tokens } from 'modules/web3/constants/tokens';

type StatField =
  | 'chief contract'
  | 'mkr in chief'
  | 'polling contract'
  | 'mkr needed to pass'
  | 'savings rate'
  | 'total dai'
  | 'debt ceiling'
  | 'system surplus';

export default function SystemStatsSidebar({
  fields = [],
  className
}: {
  fields: StatField[];
  className?: string;
}): JSX.Element {
  const { network } = useActiveWeb3React();

  const statsMap = {
    'chief contract': key => {
      const chiefAddress = useContractAddress('chief');

      return (
        <Flex key={key} sx={{ justifyContent: 'space-between', flexDirection: 'row' }}>
          <Text sx={{ fontSize: 3, color: 'textSecondary' }}>Chief Contract</Text>
          <Text variant="h2" sx={{ fontSize: 3 }}>
            {chiefAddress ? (
              <ExternalLink href={getEtherscanLink(network, chiefAddress, 'address')} target="_blank">
                <Text>{formatAddress(chiefAddress)}</Text>
              </ExternalLink>
            ) : (
              <Box sx={{ width: 6 }}>
                <Skeleton />
              </Box>
            )}
          </Text>
        </Flex>
      );
    },
    'mkr in chief': key => {
      const chiefAddress = useContractAddress('chief');
      const { data: chiefBalance } = useTokenBalance(Tokens.MKR, chiefAddress);

      return (
        <Flex key={key} sx={{ justifyContent: 'space-between', flexDirection: 'row' }}>
          <Text sx={{ fontSize: 3, color: 'textSecondary' }}>MKR in Chief</Text>
          <Text variant="h2" sx={{ fontSize: 3 }}>
            {chiefBalance ? (
              `${formatValue(chiefBalance)} MKR`
            ) : (
              <Box sx={{ width: 6 }}>
                <Skeleton />
              </Box>
            )}
          </Text>
        </Flex>
      );
    },

    'polling contract': key => {
      const pollingAddress = useContractAddress('polling');

      return (
        <Flex key={key} sx={{ justifyContent: 'space-between', flexDirection: 'row' }}>
          <Text sx={{ fontSize: 3, color: 'textSecondary' }}>Polling Contract</Text>
          <Text variant="h2" sx={{ fontSize: 3 }}>
            {pollingAddress ? (
              <ExternalLink href={getEtherscanLink(network, pollingAddress, 'address')} target="_blank">
                <Text>{formatAddress(pollingAddress)}</Text>
              </ExternalLink>
            ) : (
              <Box sx={{ width: 6 }}>
                <Skeleton />
              </Box>
            )}
          </Text>
        </Flex>
      );
    },

    'mkr needed to pass': key => {
      const { data: mkrOnHat } = useMkrOnHat();

      return (
        <Flex key={key} sx={{ justifyContent: 'space-between', flexDirection: 'row' }}>
          <Text sx={{ fontSize: 3, color: 'textSecondary' }}>MKR needed to pass</Text>
          <Text variant="h2" sx={{ fontSize: 3 }}>
            {mkrOnHat ? (
              `${formatValue(mkrOnHat)} MKR`
            ) : (
              <Box sx={{ width: 6 }}>
                <Skeleton />
              </Box>
            )}
          </Text>
        </Flex>
      );
    },

    'savings rate': key => {
      const { data: daiSavingsRate } = useDaiSavingsRate();

      return (
        <Flex key={key} sx={{ justifyContent: 'space-between', flexDirection: 'row' }}>
          <Text sx={{ fontSize: 3, color: 'textSecondary' }}>Dai Savings Rate</Text>
          <Text variant="h2" sx={{ fontSize: 3 }}>
            {daiSavingsRate ? (
              `${daiSavingsRate.toFixed(2)}%`
            ) : (
              <Box sx={{ width: 6 }}>
                <Skeleton />
              </Box>
            )}
          </Text>
        </Flex>
      );
    },

    'total dai': key => {
      const { data: totalDai } = useTotalDai();

      return (
        <Flex key={key} sx={{ justifyContent: 'space-between', flexDirection: 'row' }}>
          <Text sx={{ fontSize: 3, color: 'textSecondary' }}>Total Dai</Text>
          <Text variant="h2" sx={{ fontSize: 3 }}>
            {totalDai ? (
              `${formatValue(totalDai, 'rad')} DAI`
            ) : (
              <Box sx={{ width: 6 }}>
                <Skeleton />
              </Box>
            )}
          </Text>
        </Flex>
      );
    },

    'debt ceiling': key => {
      const { data: debtCeiling } = useSystemWideDebtCeiling();

      return (
        <Flex key={key} sx={{ justifyContent: 'space-between', flexDirection: 'row' }}>
          <Text sx={{ fontSize: 3, color: 'textSecondary' }}>Dai Debt Ceiling</Text>
          <Text variant="h2" sx={{ fontSize: 3 }}>
            {debtCeiling ? (
              `${formatValue(debtCeiling, 'rad')} DAI`
            ) : (
              <Box sx={{ width: 6 }}>
                <Skeleton />
              </Box>
            )}
          </Text>
        </Flex>
      );
    },

    'system surplus': key => {
      const { data: systemSurplus } = useSystemSurplus();

      return (
        <Flex key={key} sx={{ justifyContent: 'space-between', flexDirection: 'row', mt: 2 }}>
          <Text sx={{ fontSize: 3, color: 'textSecondary' }}>System Surplus</Text>
          <Text variant="h2" sx={{ fontSize: 3 }}>
            {systemSurplus ? (
              `${formatValue(systemSurplus, 'rad')} DAI`
            ) : (
              <Box sx={{ width: 6 }}>
                <Skeleton />
              </Box>
            )}
          </Text>
        </Flex>
      );
    }
  };

  return (
    <Box sx={{ display: ['none', 'block'] }} className={className}>
      <Flex sx={{ flexDirection: 'row', justifyContent: 'space-between', mb: 2, mt: 3 }}>
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
  );
}
