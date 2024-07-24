/*

SPDX-FileCopyrightText: © 2023 Dai Foundation <www.daifoundation.org>

SPDX-License-Identifier: AGPL-3.0-or-later

*/

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
import { SupportedNetworks } from 'modules/web3/constants/networks';
import { getContracts } from 'modules/web3/helpers/getContracts';
import { networkNameToChainId } from 'modules/web3/helpers/chain';

const aaveLendingPoolCore = '0x3dfd23A6c5E8BbcFc9581d2E864a68feb6a076d3';
const aaveV2Amkr = '0xc713e5E149D5D0715DcD1c156a020976e7E56B88';
const uniswapV2MkrEthPool = '0xC2aDdA861F89bBB333c90c492cB837741916A225';
const uniswapV2MkrDaiPool = '0x517f9dd285e75b599234f7221227339478d0fcc8';
const uniswapV3MkrEthPointThreePercentPool = '0xe8c6c9227491C0a8156A0106A0204d881BB7E531';
const uniswapV3MkrEthOnePercentPool = '0x3aFdC5e6DfC0B0a507A8e023c9Dce2CAfC310316';
const sushiswapAddress = '0xba13afecda9beb75de5c56bbaf696b880a5a50dd';
const compoundCTokenAddress = '0x95b4eF2869eBD94BEb4eEE400a99824BF5DC325b';

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

async function getCompoundMkr(network: SupportedNetworks) {
  if (network !== SupportedNetworks.MAINNET) return BigNumber.from(0);

  const chainId = networkNameToChainId(network);
  const { mkr: mkrContract } = getContracts(chainId);
  const compoundMkr = await mkrContract.balanceOf(compoundCTokenAddress);

  return compoundMkr;
}

export default function MkrLiquiditySidebar({
  network,
  className
}: {
  network: SupportedNetworks;
  className?: string;
}): JSX.Element {
  const [expanded, setExpanded] = useState({});

  const mkrAddress = useContractAddress(Tokens.MKR);
  const { data: aaveV1 } = useTokenBalance(Tokens.MKR, aaveLendingPoolCore);
  const { data: aaveV2 } = useTokenBalance(Tokens.MKR, aaveV2Amkr);
  const { data: uniswapV2MkrEth } = useTokenBalance(Tokens.MKR, uniswapV2MkrEthPool);
  const { data: uniswapV2MkrDai } = useTokenBalance(Tokens.MKR, uniswapV2MkrDaiPool);
  const { data: uniswapV3MkrEthPointThreePercent } = useTokenBalance(Tokens.MKR, uniswapV3MkrEthPointThreePercentPool);
  const { data: uniswapV3MkrEthOnePercent } = useTokenBalance(Tokens.MKR, uniswapV3MkrEthOnePercentPool);
  const { data: sushi } = useTokenBalance(Tokens.MKR, sushiswapAddress);

  const { data: balancer } = useSWR(
    `${mkrAddress}/mkr-liquidity-balancer`,
    () => getBalancerMkr(mkrAddress),
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
      uniswapV2MkrEth && uniswapV2MkrDai && uniswapV3MkrEthPointThreePercent && uniswapV3MkrEthOnePercent && uniswapV2MkrEth?.add(uniswapV2MkrDai).add(uniswapV3MkrEthPointThreePercent).add(uniswapV3MkrEthOnePercent),
      [
        ['Uniswap V2 (MKR/DAI)', uniswapV2MkrDai],
        ['Uniswap V3 (MKR/ETH 0.3%)', uniswapV3MkrEthPointThreePercent],
        ['Uniswap V3 (MKR/ETH 1%)', uniswapV3MkrEthOnePercent],
        ['Uniswap V2 (MKR/ETH)', uniswapV2MkrEth]
      ]
    ],
    ['Sushi', sushi],
    ['Compound', compound]
  ].sort((a, b) => (a[1] && b[1] ? ((a[1] as BigNumber).gt(b[1] as BigNumber) ? -1 : 1) : 0));

  const totalLiquidity = `${formatValue(
    mkrPools.reduce((acc, cur) => acc.add((cur[1] as BigNumber) || 0), BigNumber.from(0))
  )} MKR`;

  const PoolComponent = pool => {
    const [poolName, poolLiquidity, subpools] = pool;
    return (
      <Flex key={poolName} sx={{ flexDirection: 'column' }}>
        <Flex sx={{ justifyContent: 'space-between', flexDirection: 'row' }}>
          <Flex sx={{ alignItems: 'center' }}>
            <Text sx={{ fontSize: 3, color: 'textSecondary' }}>MKR in {poolName}</Text>
            {subpools && (
              <Box sx={{ ml: 1 }}>
                <Flex
                  sx={{
                    bg: 'background',
                    size: 'auto',
                    width: '17px',
                    height: '17px',
                    alignItems: 'center',
                    justifyContent: 'center',
                    borderRadius: 'round'
                  }}
                >
                  <IconButton
                    aria-label={`${poolName} pools expand`}
                    onClick={() =>
                      setExpanded({
                        ...expanded,
                        [poolName]: !expanded[poolName]
                      })
                    }
                  >
                    <Icon size={2} name={expanded[poolName] ? 'minus' : 'plus'} color="textSecondary" />
                  </IconButton>
                </Flex>
              </Box>
            )}
          </Flex>
          <Text variant="h2" sx={{ fontSize: 3 }}>
            {poolLiquidity ? (
              `${formatValue(poolLiquidity)} MKR`
            ) : (
              <Box sx={{ width: 6 }}>
                <Skeleton />
              </Box>
            )}
          </Text>
        </Flex>
        {subpools && expanded[poolName] && (
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
                      `${formatValue(subpoolLiquidity)} MKR`
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
