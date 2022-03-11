import { useState } from 'react';
import { Card, Flex, Text, Box, Heading, IconButton } from 'theme-ui';
import useSWR from 'swr';
import { Icon } from '@makerdao/dai-ui-icons';
import { request } from 'graphql-request';
import Skeleton from 'modules/app/components/SkeletonThemed';
import Stack from 'modules/app/components/layout/layouts/Stack';
import { useTokenBalance } from 'modules/web3/hooks/useTokenBalance';
import { useContractAddress } from 'modules/web3/hooks/useContractAddress';
import { BigNumber } from 'ethers';
import { formatValue } from 'lib/string';
import { parseUnits } from 'ethers/lib/utils';
import { Tokens } from 'modules/web3/constants/tokens';
import { uniswapV3MkrSupply } from 'modules/gql/queries/uniswapV3MkrSupply';
import { WAD } from 'modules/web3/constants/numbers';
import { SupportedNetworks } from 'modules/web3/constants/networks';

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

async function getUniswapV3Mkr(mkrAddress: string) {
  const resp = await request(
    'https://api.thegraph.com/subgraphs/name/uniswap/uniswap-v3',
    uniswapV3MkrSupply,
    { argMkrAddress: mkrAddress }
  );
  return resp?.token?.totalSupply ? BigNumber.from(resp.token.totalSupply).mul(WAD) : BigNumber.from(0);
}

async function getCompoundMkr(network) {
  if (network !== SupportedNetworks.MAINNET) return BigNumber.from(0);

  const resp = await fetch('https://api.compound.finance/api/v2/ctoken');
  const json = await resp.json();

  const mkr = json.cToken?.find(token => token.underlying_symbol === 'MKR')?.cash?.value;
  return BigNumber.from(Math.round(mkr)).mul(WAD);
}

export default function MkrLiquiditySidebar({
  network,
  className
}: {
  network: SupportedNetworks;
  className?: string;
}): JSX.Element {
  const [expanded, setExpanded] = useState(false);

  const mkrAddress = useContractAddress(Tokens.MKR);
  const { data: aaveV1 } = useTokenBalance(Tokens.MKR, aaveLendingPoolCore);
  const { data: aaveV2 } = useTokenBalance(Tokens.MKR, aaveV2Amkr);
  const { data: uniswapV2 } = useTokenBalance(Tokens.MKR, uniswapV2MkrPool);
  const { data: sushi } = useTokenBalance(Tokens.MKR, sushiswapAddress);

  const { data: balancer } = useSWR(
    `${mkrAddress}/mkr-liquidity-balancer`,
    () => getBalancerMkr(mkrAddress),
    { refreshInterval: 60000 }
  );

  const { data: uniswapV3 } = useSWR(
    `${mkrAddress}/mkr-liquidity-uniswapV3`,
    () => getUniswapV3Mkr(mkrAddress),
    { refreshInterval: 60000 }
  );

  const { data: compound } = useSWR(`${mkrAddress}/mkr-liquidity-compound`, () => getCompoundMkr(network), {
    refreshInterval: 60000
  });

  const mkrPools = [
    ['Balancer', balancer],
    [
      'Aave',
      aaveV1 && aaveV2 && aaveV1?.add(aaveV2),
      [
        ['Aave V1', aaveV1],
        ['Aave V2', aaveV2]
      ]
    ],
    [
      'Uniswap',
      uniswapV2 && uniswapV3 && uniswapV2?.add(uniswapV3),
      [
        ['Uniswap V2', uniswapV2],
        ['Uniswap V3', uniswapV3]
      ]
    ],
    ['Sushi', sushi],
    ['Compound', compound]
  ].sort((a, b) => (a[1] && b[1] ? ((a[1] as BigNumber).gt(b[1] as BigNumber) ? -1 : 1) : 0));

  const totalLiquidity = `${formatValue(
    mkrPools.reduce((acc, cur) => acc.add((cur[1] as BigNumber) || 0), BigNumber.from(0)),
    'wad',
    0
  )} MKR`;

  const PoolComponent = pool => {
    const [poolName, poolLiquidity, subpools] = pool;
    return (
      <Flex sx={{ flexDirection: 'column' }}>
        <Flex key={poolName} sx={{ justifyContent: 'space-between', flexDirection: 'row' }}>
          <Flex sx={{ alignItems: 'center' }}>
            <Text sx={{ fontSize: 3, color: 'textSecondary' }}>MKR in {poolName}</Text>
            {subpools && (
              <IconButton
                aria-label={`${poolName} pools expand`}
                onClick={() => setExpanded(!expanded)}
                sx={{ py: 0, height: 3 }}
              >
                <Icon size={2} name={expanded ? 'minus' : 'plus'} color="textSecondary" />
              </IconButton>
            )}
          </Flex>
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
        {subpools && expanded && (
          <Flex sx={{ flexDirection: 'column' }}>
            {subpools.map(subpool => {
              const [subpoolName, subpoolLiquidity] = subpool;
              return (
                <Flex
                  key={subpoolName}
                  sx={{
                    justifyContent: 'space-between',
                    flexDirection: 'row',
                    mt: 2,
                    ml: 3
                  }}
                >
                  <Flex sx={{ alignItems: 'center' }}>
                    <Text sx={{ fontSize: 2, color: 'textSecondary' }}>MKR in {subpoolName}</Text>
                  </Flex>
                  <Text variant="h2" sx={{ fontSize: 2, color: 'textSecondary' }}>
                    {subpoolLiquidity ? (
                      `${formatValue(subpoolLiquidity, 'wad', 0)} MKR`
                    ) : (
                      <Box sx={{ width: 6 }}>
                        <Skeleton />
                      </Box>
                    )}
                  </Text>
                </Flex>
              );
            })}
          </Flex>
        )}
      </Flex>
    );
  };

  return (
    <Box sx={{ display: ['none', 'block'] }} className={className}>
      <Flex sx={{ alignItems: 'center', justifyContent: 'space-between', mb: 2, mt: 4 }}>
        <Heading as="h3" variant="microHeading">
          MKR Liquidity
        </Heading>
        <Text sx={{ fontSize: 4 }}>{totalLiquidity}</Text>
      </Flex>
      <Card variant="compact">
        <Stack gap={3}>{mkrPools.map(p => PoolComponent(p))}</Stack>
      </Card>
    </Box>
  );
}
