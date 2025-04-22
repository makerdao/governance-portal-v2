/*

SPDX-FileCopyrightText: © 2023 Dai Foundation <www.daifoundation.org>

SPDX-License-Identifier: AGPL-3.0-or-later

*/

import { useState } from 'react';
import { Card, Flex, Text, Box, Heading, IconButton, Divider } from 'theme-ui';
import useSWR from 'swr';
import Icon from 'modules/app/components/Icon';
import Skeleton from 'modules/app/components/SkeletonThemed';
import Stack from 'modules/app/components/layout/layouts/Stack';
import { formatValue } from 'lib/string';
import { Abi, parseEther } from 'viem';
import { SupportedNetworks } from 'modules/web3/constants/networks';
import { networkNameToChainId } from 'modules/web3/helpers/chain';
import { config } from 'lib/config';
import { useChainId, useReadContracts } from 'wagmi';
import {
  mkrAbi,
  mkrAddress as mkrAddressMapping,
  skyAbi,
  skyAddress as skyAddressMapping
} from 'modules/contracts/generated';
import { getPublicClient } from 'modules/web3/helpers/getPublicClient';
import { MKR_TO_SKY_PRICE_RATIO } from 'modules/web3/constants/conversions';

const aaveLendingPoolCore = '0x3dfd23A6c5E8BbcFc9581d2E864a68feb6a076d3';
const aaveV2Amkr = '0xc713e5E149D5D0715DcD1c156a020976e7E56B88';

const uniswapV2MkrEthPool = '0xC2aDdA861F89bBB333c90c492cB837741916A225';
const uniswapV2MkrDaiPool = '0x517f9dd285e75b599234f7221227339478d0fcc8';
const uniswapV3MkrEthPointThreePercentPool = '0xe8c6c9227491C0a8156A0106A0204d881BB7E531';
const uniswapV3MkrEthOnePercentPool = '0x3aFdC5e6DfC0B0a507A8e023c9Dce2CAfC310316';

const sushiswapAddress = '0xba13afecda9beb75de5c56bbaf696b880a5a50dd';
const compoundCTokenAddress = '0x95b4eF2869eBD94BEb4eEE400a99824BF5DC325b';

const uniswapV3SkyEthPointThreePercentPool = '0x764510aB1d39CF300e7abe8F5B8977D18F290628';
const uniswapV3SkyEthOnePercentPool = '0xDa99F4f2FE926b90F07f5F4EB0Ce773f7173c6a0';

async function getBalancerV1TokenBalance(tokenAddress: string, tokenSymbol: string) {
  const resp = await fetch(
    `https://gateway-arbitrum.network.thegraph.com/api/${config.SUBGRAPH_API_KEY}/subgraphs/id/93yusydMYauh7cfe9jEfoGABmwnX4GffHd7in8KJi1XB`,
    {
      method: 'post',
      body: JSON.stringify({
        query: `
          query PostsForPools {
            pools(where: {tokensList_contains: ["${tokenAddress}"], publicSwap: true}) {
              tokens {
                address
                balance
                symbol
              }
            }
          }
          `
      })
    }
  );
  const json = await resp.json();
  const balancerNum = json.data.pools
    .flatMap(pool => pool.tokens)
    .reduce((sum, token) => (token.symbol === tokenSymbol ? parseFloat(token.balance) : 0) + sum, 0);
  return parseEther(parseInt(balancerNum).toString());
}

async function getBalancerV2TokenBalance(tokenAddress: string) {
  const resp = await fetch(
    `https://gateway-arbitrum.network.thegraph.com/api/${config.SUBGRAPH_API_KEY}/subgraphs/id/C4ayEZP2yTXRAB8vSaTrgN4m9anTe9Mdm2ViyiAuV9TV`,
    {
      method: 'post',
      body: JSON.stringify({
        query: `
          query PostsForPools {
            pools(where: {tokensList_contains: ["${tokenAddress}"]}) {
              tokens {
                address
                balance
                symbol
              }
            }
          }
          `
      })
    }
  );
  const json = await resp.json();
  const balancerNum = json.data.pools
    .flatMap(pool => pool.tokens)
    .reduce(
      (sum, token) =>
        (token.address.toLowerCase() === tokenAddress.toLowerCase() ? parseFloat(token.balance) : 0) + sum,
      0
    );
  return parseEther(parseInt(balancerNum).toString());
}

async function getCompoundTokenBalance(network: SupportedNetworks, address: `0x${string}`, abi: Abi) {
  if (network !== SupportedNetworks.MAINNET) return 0n;

  const chainId = networkNameToChainId(network);
  const publicClient = getPublicClient(chainId);

  const compoundTokenBalance = await publicClient.readContract({
    address,
    abi,
    functionName: 'balanceOf',
    args: [compoundCTokenAddress]
  });

  return compoundTokenBalance;
}

export default function MkrSkyLiquiditySidebar({
  network,
  className
}: {
  network: SupportedNetworks;
  className?: string;
}): JSX.Element {
  const [expanded, setExpanded] = useState({});
  const chainId = useChainId();

  const mkrAddress = mkrAddressMapping[chainId];
  const mkrSymbol = 'MKR';
  const skyAddress = skyAddressMapping[chainId];
  const skySymbol = 'SKY';

  const liquidityCallParamsMkr = {
    address: mkrAddress,
    abi: mkrAbi,
    chainId,
    functionName: 'balanceOf'
  } as const;

  const liquidityCallParamsSky = {
    address: skyAddress,
    abi: skyAbi,
    chainId,
    functionName: 'balanceOf'
  } as const;

  const {
    data: [
      aaveV1,
      aaveV2,
      uniswapV2MkrEth,
      uniswapV2MkrDai,
      uniswapV3MkrEthPointThreePercent,
      uniswapV3MkrEthOnePercent,
      sushi
    ] = []
  } = useReadContracts({
    contracts: [
      {
        ...liquidityCallParamsMkr,
        args: [aaveLendingPoolCore]
      },
      {
        ...liquidityCallParamsMkr,
        args: [aaveV2Amkr]
      },
      {
        ...liquidityCallParamsMkr,
        args: [uniswapV2MkrEthPool]
      },
      {
        ...liquidityCallParamsMkr,
        args: [uniswapV2MkrDaiPool]
      },
      {
        ...liquidityCallParamsMkr,
        args: [uniswapV3MkrEthPointThreePercentPool]
      },
      {
        ...liquidityCallParamsMkr,
        args: [uniswapV3MkrEthOnePercentPool]
      },
      {
        ...liquidityCallParamsMkr,
        args: [sushiswapAddress]
      }
    ],
    allowFailure: false,
    scopeKey: `mkr-liquidity-${chainId}`
  });

  const { data: [uniswapV3SkyEthPointThreePercent, uniswapV3SkyEthOnePercent] = [] } = useReadContracts({
    contracts: [
      {
        ...liquidityCallParamsSky,
        args: [uniswapV3SkyEthPointThreePercentPool]
      },
      {
        ...liquidityCallParamsSky,
        args: [uniswapV3SkyEthOnePercentPool]
      }
    ],
    allowFailure: false,
    scopeKey: `sky-liquidity-${chainId}`
  });

  const { data: balancerV1Mkr } = useSWR(
    `${mkrAddress}/mkr-liquidity-balancer-v1`,
    () => getBalancerV1TokenBalance(mkrAddress, mkrSymbol),
    { refreshInterval: 60000 }
  );

  const { data: balancerV2Mkr } = useSWR(
    `${mkrAddress}/mkr-liquidity-balancer-v2`,
    () => getBalancerV2TokenBalance(mkrAddress),
    { refreshInterval: 60000 }
  );

  const { data: compoundMkr } = useSWR(
    `${mkrAddress}/mkr-liquidity-compound`,
    () => getCompoundTokenBalance(network, mkrAddress, mkrAbi),
    {
      refreshInterval: 60000
    }
  );

  const mkrPools = [
    [
      'Balancer',
      balancerV1Mkr && balancerV2Mkr && balancerV1Mkr + balancerV2Mkr,
      [
        ['Balancer V1', balancerV1Mkr],
        ['Balancer V2', balancerV2Mkr]
      ]
    ],
    [
      'Aave',
      aaveV1 && aaveV2 && aaveV1 + aaveV2,
      [
        ['Aave V1', aaveV1],
        ['Aave V2', aaveV2]
      ]
    ],
    [
      'Uniswap',
      uniswapV2MkrEth &&
        uniswapV2MkrDai &&
        uniswapV3MkrEthPointThreePercent &&
        uniswapV3MkrEthOnePercent &&
        uniswapV2MkrEth + uniswapV2MkrDai + uniswapV3MkrEthPointThreePercent + uniswapV3MkrEthOnePercent,
      [
        ['Uniswap V2 (MKR/DAI)', uniswapV2MkrDai],
        ['Uniswap V3 (MKR/ETH 0.3%)', uniswapV3MkrEthPointThreePercent],
        ['Uniswap V3 (MKR/ETH 1%)', uniswapV3MkrEthOnePercent],
        ['Uniswap V2 (MKR/ETH)', uniswapV2MkrEth]
      ]
    ],
    ['Sushi', sushi],
    ['Compound', compoundMkr]
  ].sort((a, b) => (a[1] && b[1] ? (a[1] > b[1] ? -1 : 1) : 0));

  const skyPools = [
    [
      'Uniswap',
      uniswapV3SkyEthPointThreePercent &&
        uniswapV3SkyEthOnePercent &&
        uniswapV3SkyEthPointThreePercent + uniswapV3SkyEthOnePercent,
      [
        ['Uniswap V3 (SKY/ETH 0.3%)', uniswapV3SkyEthPointThreePercent],
        ['Uniswap V3 (SKY/ETH 1%)', uniswapV3SkyEthOnePercent]
      ]
    ]
  ].sort((a, b) => (a[1] && b[1] ? (a[1] > b[1] ? -1 : 1) : 0));

  const totalMkrLiquidity = mkrPools.reduce((acc, cur) => acc + ((cur[1] as bigint | undefined) || 0n), 0n);
  const totalSkyLiquidity = skyPools.reduce((acc, cur) => acc + ((cur[1] as bigint | undefined) || 0n), 0n);

  const totalLiquidityInSky = totalMkrLiquidity * MKR_TO_SKY_PRICE_RATIO + totalSkyLiquidity;

  const PoolComponent = (pool, tokenSymbol: 'MKR' | 'SKY') => {
    const [poolName, poolLiquidity, subpools] = pool;
    return (
      <Flex key={`${tokenSymbol}-${poolName}`} sx={{ flexDirection: 'column' }}>
        <Flex sx={{ justifyContent: 'space-between', flexDirection: 'row' }}>
          <Flex sx={{ alignItems: 'center' }}>
            <Text sx={{ fontSize: 3, color: 'textSecondary' }}>
              {tokenSymbol} in {poolName}
            </Text>
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
                        [`${tokenSymbol}-${poolName}`]: !expanded[`${tokenSymbol}-${poolName}`]
                      })
                    }
                  >
                    <Icon
                      size={2}
                      name={expanded[`${tokenSymbol}-${poolName}`] ? 'minus' : 'plus'}
                      color="textSecondary"
                    />
                  </IconButton>
                </Flex>
              </Box>
            )}
          </Flex>
          <Text variant="h2" sx={{ fontSize: 3 }}>
            {poolLiquidity ? (
              `${formatValue(poolLiquidity)} ${tokenSymbol}`
            ) : (
              <Box sx={{ width: 6 }}>
                <Skeleton />
              </Box>
            )}
          </Text>
        </Flex>
        {subpools && expanded[`${tokenSymbol}-${poolName}`] && (
          <Flex sx={{ flexDirection: 'column' }}>
            {subpools.map(subpool => {
              const [subpoolName, subpoolLiquidity] = subpool;
              return (
                <Flex
                  key={`${tokenSymbol}-${subpoolName}`}
                  sx={{
                    justifyContent: 'space-between',
                    flexDirection: 'row',
                    mt: 2,
                    ml: 3
                  }}
                >
                  <Flex sx={{ alignItems: 'center' }}>
                    <Text sx={{ fontSize: 2, color: 'textSecondary' }}>
                      {tokenSymbol} in {subpoolName}
                    </Text>
                  </Flex>
                  <Text variant="h2" sx={{ fontSize: 2, color: 'textSecondary' }}>
                    {subpoolLiquidity ? (
                      `${formatValue(subpoolLiquidity)} ${tokenSymbol}`
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
          SKY and MKR Liquidity
        </Heading>
        <Text sx={{ fontSize: 4 }}>{`${formatValue(totalLiquidityInSky)} SKY`}</Text>
      </Flex>
      <Card variant="compact">
        <Stack gap={3} sx={{ mb: 3 }}>
          {skyPools.map(p => PoolComponent(p, skySymbol))}
        </Stack>
        <Divider />
        <Stack gap={3}>{mkrPools.map(p => PoolComponent(p, mkrSymbol))}</Stack>
      </Card>
    </Box>
  );
}
