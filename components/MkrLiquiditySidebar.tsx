/** @jsx jsx */
import { Card, Flex, Text, Box, Heading, jsx } from 'theme-ui';
import useSWR from 'swr';
import Skeleton from 'components/SkeletonThemed';
import Stack from './layouts/Stack';
import getMaker from 'lib/maker';
import { MKR } from 'lib/maker';

const aaveLendingPoolCore = '0x3dfd23A6c5E8BbcFc9581d2E864a68feb6a076d3';
const aaveV2Amkr = '0xc713e5E149D5D0715DcD1c156a020976e7E56B88';
const uniswapV2MkrPool = '0xC2aDdA861F89bBB333c90c492cB837741916A225';
const sushiswapAddress = '0xba13afecda9beb75de5c56bbaf696b880a5a50dd';

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
    maker.service('token').getToken(MKR).balanceOf(aaveV2Amkr),
    maker.service('token').getToken(MKR).balanceOf(uniswapV2MkrPool),
    maker.service('token').getToken(MKR).balanceOf(sushiswapAddress)
  ]);
}

export default function MkrLiquiditySidebar({ ...props }): JSX.Element {
  const { data: nonBalancer } = useSWR('/mkr-liquidity', getMkrLiquidity, { refreshInterval: 60000 });
  const { data: balancer } = useSWR('/mkr-liquidity-balancer', getBalancerMkr, { refreshInterval: 60000 });
  const [aaveV1, aaveV2, uniswap, sushi] = nonBalancer || [];
  const mkrPools = [
    ['Balancer', balancer],
    ['Aave', aaveV1 && aaveV2 && aaveV1.plus(aaveV2)],
    ['Uniswap V2', uniswap],
    ['Sushi', sushi]
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
