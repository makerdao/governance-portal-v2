import { Card, Flex, Text, Box, Heading } from 'theme-ui';
import useSWR from 'swr';
import Skeleton from 'modules/app/components/SkeletonThemed';
import Stack from 'modules/app/components/layout/layouts/Stack';
import { useTokenBalance } from 'modules/web3/hooks/useTokenBalance';
import { useContractAddress } from 'modules/web3/hooks/useContractAddress';
import { BigNumber } from 'ethers';
import { formatValue } from 'lib/string';
import { parseUnits } from 'ethers/lib/utils';
import { Tokens } from 'modules/web3/constants/tokens';

const aaveLendingPoolCore = '0x3dfd23A6c5E8BbcFc9581d2E864a68feb6a076d3';
const aaveV2Amkr = '0xc713e5E149D5D0715DcD1c156a020976e7E56B88';
const uniswapV2MkrPool = '0xC2aDdA861F89bBB333c90c492cB837741916A225';
const sushiswapAddress = '0xba13afecda9beb75de5c56bbaf696b880a5a50dd';

async function getBalancerMkr(mkrAddress: string) {
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
  return parseUnits(parseInt(balancerNum).toString());
}

export default function MkrLiquiditySidebar({ className }: { className?: string }): JSX.Element {
  const mkrAddress = useContractAddress(Tokens.MKR);
  const { data: aaveV1 } = useTokenBalance(Tokens.MKR, aaveLendingPoolCore);
  const { data: aaveV2 } = useTokenBalance(Tokens.MKR, aaveV2Amkr);
  const { data: uniswap } = useTokenBalance(Tokens.MKR, uniswapV2MkrPool);
  const { data: sushi } = useTokenBalance(Tokens.MKR, sushiswapAddress);

  const { data: balancer } = useSWR(
    `${mkrAddress}/mkr-liquidity-balancer`,
    () => getBalancerMkr(mkrAddress),
    { refreshInterval: 60000 }
  );

  const mkrPools = [
    ['Balancer', balancer],
    ['Aave', aaveV1 && aaveV2 && aaveV1?.add(aaveV2)],
    ['Uniswap V2', uniswap],
    ['Sushi', sushi]
  ].sort((a, b) => (a[1] && b[1] ? ((a[1] as BigNumber).gt(b[1]) ? -1 : 1) : 0));

  const PoolComponent = pool => {
    const [poolName, poolLiquidity] = pool;
    return (
      <Flex key={poolName} sx={{ justifyContent: 'space-between', flexDirection: 'row' }}>
        <Text sx={{ fontSize: 3, color: 'textSecondary' }}>MKR in {poolName}</Text>
        <Text variant="h2" sx={{ fontSize: 3 }}>
          {poolLiquidity ? (
            `${formatValue(poolLiquidity, 'wad', 0)} MKR`
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
    <Box sx={{ display: ['none', 'block'] }} className={className}>
      <Heading as="h3" variant="microHeading" sx={{ mb: 2, mt: 3 }}>
        MKR Liquidity
      </Heading>
      <Card variant="compact">
        <Stack gap={3}>{mkrPools.map(p => PoolComponent(p))}</Stack>
      </Card>
    </Box>
  );
}
