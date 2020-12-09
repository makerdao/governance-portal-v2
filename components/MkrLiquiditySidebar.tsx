/** @jsx jsx */
import { Card, Flex, Text, Box, Heading, jsx } from 'theme-ui';
import useSWR from 'swr';
import Skeleton from 'react-loading-skeleton';
import Stack from './layouts/Stack';
import getMaker from '../lib/maker';
import { MKR } from '../lib/maker';

const aaveLendingPoolCore = '0x3dfd23A6c5E8BbcFc9581d2E864a68feb6a076d3';
const uniswapV2MkrPool = '0xC2aDdA861F89bBB333c90c492cB837741916A225';

async function getBalancerMkr() {
  const maker = await getMaker();
  const mkrAddress = maker.service('token').getToken('MKR').address();

  const resp = await fetch('https://api.thegraph.com/subgraphs/name/balancer-labs/balancer', {
    method: 'post',
    body: JSON.stringify({
      query: `
          query PostsForPools {
            pools(where: {tokensList_contains: ["${mkrAddress}"], publicSwap: true}) {
              tokens {
                address
                balance
                symbol
              }
            }
          }
          `
    })
  });
  const json = await resp.json();
  const balancerNum = json.data.pools
    .flatMap(pool => pool.tokens)
    .reduce((sum, token) => (token.symbol === 'MKR' ? parseFloat(token.balance) : 0) + sum, 0);
  return MKR(balancerNum);
}

async function getMkrLiquidity() {
  const maker = await getMaker();
  return Promise.all([
    maker.service('token').getToken(MKR).balanceOf(aaveLendingPoolCore),
    maker.service('token').getToken(MKR).balanceOf(uniswapV2MkrPool)
  ]);
}

export default function MkrLiquiditySidebar({ ...props }): JSX.Element {
  const { data: nonBalancer } = useSWR('/mkr-liquidity', getMkrLiquidity, { refreshInterval: 60000 });
  const { data: balancer } = useSWR('/mkr-liquidity-balancer', getBalancerMkr, { refreshInterval: 60000 });
  const [aave, uniswap] = nonBalancer || [];
  const mkrPools = [
    ['Balancer', balancer],
    ['Aave', aave],
    ['Uniswap V2', uniswap]
  ].sort((a, b) => a[1] && b[1] && b[1].toBigNumber().minus(a[1].toBigNumber()).toNumber());

  const PoolComponent = pool => {
    const [poolName, poolLiquidity] = pool;
    return (
      <Flex key={poolName} sx={{ justifyContent: 'space-between', flexDirection: 'row' }}>
        <Text sx={{ fontSize: 3, color: 'textSecondary' }}>MKR in {poolName}</Text>
        <Text variant="h2" sx={{ fontSize: 3 }}>
          {poolLiquidity ? (
            `${poolLiquidity.toBigNumber().toFormat(0)} MKR`
          ) : (
            <Box sx={{ width: 6 }}>
              <Skeleton />
            </Box>
          )}
        </Text>
      </Flex>
    );
  };

  return (
    <Box sx={{ display: ['none', 'block'] }} {...props}>
      <Heading as="h3" variant="microHeading" sx={{ mb: 2, mt: 3 }}>
        MKR Liquidity
      </Heading>
      <Card variant="compact">
        <Stack gap={3}>{mkrPools.map(p => PoolComponent(p))}</Stack>
      </Card>
    </Box>
  );
}
