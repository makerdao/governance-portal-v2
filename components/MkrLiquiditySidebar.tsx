/** @jsx jsx */
import { Card, Flex, Link as ExternalLink, Text, Box, Heading, jsx } from 'theme-ui';
import useSWR, { mutate } from 'swr';
import Skeleton from 'react-loading-skeleton';

import Stack from './layouts/Stack';
import getMaker, { DAI } from '../lib/maker';
import { bigNumberKFormat } from '../lib/utils';
import CurrencyObject from '../types/currency';
import { MKR } from '../lib/maker';

const aaveMkrReserveAddress = "0x3dfd23A6c5E8BbcFc9581d2E864a68feb6a076d3";
const aaveMkrReserveAbi = [
  {"constant":true,"inputs":[{"internalType":"address","name":"_reserve","type":"address"}],"name":"getReserveAvailableLiquidity","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"}
  ];

async function getMkrLiquidity() {
  const maker = await getMaker();
  const scs = maker.service('smartContract');
  const aaveMkrReserve = scs.getContractByAddressAndAbi(
    aaveMkrReserveAddress, aaveMkrReserveAbi);
  return Promise.all([
    aaveMkrReserve.getReserveAvailableLiquidity(scs.getContractAddress('MCD_GOV')),
    Promise.resolve(1),
    Promise.resolve(1)
  ]);
}

// if we are on the browser, trigger a prefetch as soon as possible
if (typeof window !== 'undefined') {
  getMkrLiquidity().then(liq => {
    mutate('/mkr-liquidiy', liq, false);
  });
}

type StatField = 'MKR in Aave' | 'MKR in Balancer' | 'MKR in Uniswap';

export default function SystemStatsSidebar({ fields = [], ...props }: { fields: StatField[] }): JSX.Element {
  const { data } = useSWR<CurrencyObject[]>('/mkr-liquidity', getMkrLiquidity);
  const [aave, balancer, uniswap] = data || [];
  console.log(MKR(aave));
  const statsMap = {
    'MKR in Aave': key => (
      <Flex key={key} sx={{ justifyContent: 'space-between', flexDirection: 'row' }}>
        <Text sx={{ fontSize: 3, color: 'textSecondary' }}>MKR in Aave</Text>
        <Text variant="h2" sx={{ fontSize: 3 }}>
          {data ? (
            `${MKR(aave).div(10**18).toFixed()} MKR`
          ) : (
            <Box sx={{ width: 6 }}>
              <Skeleton />
            </Box>
          )}
        </Text>
      </Flex>
    ),

    'MKR in Balancer': key => (
      <Flex key={key} sx={{ justifyContent: 'space-between', flexDirection: 'row' }}>
        <Text sx={{ fontSize: 3, color: 'textSecondary' }}>MKR in Balancer</Text>
        <Text variant="h2" sx={{ fontSize: 3 }}>
          {data ? (
            `${balancer} MKR`
          ) : (
            <Box sx={{ width: 6 }}>
              <Skeleton />
            </Box>
          )}
        </Text>
      </Flex>
    ),

    'MKR in Uniswap': key => (
      <Flex key={key} sx={{ justifyContent: 'space-between', flexDirection: 'row' }}>
        <Text sx={{ fontSize: 3, color: 'textSecondary' }}>MKR in Uniswap</Text>
        <Text variant="h2" sx={{ fontSize: 3 }}>
          {data ? (
            `${uniswap} MKR`
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
          <Heading as="h3" variant="microHeading" sx={{mb: 2, mt: 3}} >
            MKR Liquidity
          </Heading>
        <Card variant="compact">
          <Stack gap={3}>{fields.map(field => statsMap[field](field))}</Stack>
        </Card>
      </Box>
    </>
  );
}