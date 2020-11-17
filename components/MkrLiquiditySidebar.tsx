/** @jsx jsx */
import { Card, Flex, Link as ExternalLink, Text, Box, Heading, jsx } from 'theme-ui';
import useSWR from 'swr';
import Skeleton from 'react-loading-skeleton';

import Stack from './layouts/Stack';
import getMaker, { DAI } from '../lib/maker';
import CurrencyObject from '../types/currency';
import { MKR } from '../lib/maker';
const axios = require('axios');

const aaveLendingPoolCore = '0x3dfd23A6c5E8BbcFc9581d2E864a68feb6a076d3';
const uniswapV2MkrPool = '0xC2aDdA861F89bBB333c90c492cB837741916A225';

async function getBalancerMkr() {
  let balancerNum = 0;
  return axios({
    url: 'https://api.thegraph.com/subgraphs/name/balancer-labs/balancer',
    method: 'post',
    data: {
      query: `
        query PostsForPools {
          pools(where: {tokensList_contains: ["0x9f8f72aa9304c8b593d555f12ef6589cc3a579a2"], publicSwap: true}) {
                  tokens {
                    address
                    balance
                    symbol
                  }
              }
        }
        `
    }
  }).then((result) => {
    result.data.data.pools.forEach(function (pool) {
      pool.tokens.forEach(function (token) {
         if (token.symbol == "MKR") {
          balancerNum = balancerNum + parseFloat(token.balance)
         }
      })
    });
    return MKR(balancerNum);
  });
}

async function getMkrLiquidity() {
  const maker = await getMaker();
  return Promise.all([
    maker.service('token').getToken(MKR).balanceOf(aaveLendingPoolCore),
    maker.service('token').getToken(MKR).balanceOf(uniswapV2MkrPool)
  ]);
}

export default function SystemStatsSidebar({ ...props }): JSX.Element {
  const { data: nonBalancer } = useSWR('/mkr-liquidity', getMkrLiquidity, { refreshInterval: 60000 });
  const { data: balancer } = useSWR('/mkr-liquidity-balancer', getBalancerMkr, { refreshInterval: 60000 });
  const [aave, uniswap] = nonBalancer || [];
  let mkrPools = [['Balancer', balancer], ['Aave', aave], ['Uniswap V2', uniswap]]
    .sort((a,b) => a[1] && b[1] && b[1].toBigNumber().minus(a[1].toBigNumber()));

  const PoolComponent = pool => (
    <Flex key={pool[0]} sx={{ justifyContent: 'space-between', flexDirection: 'row' }}>
      <Text sx={{ fontSize: 3, color: 'textSecondary' }}>MKR in {pool[0]}</Text>
      <Text variant="h2" sx={{ fontSize: 3 }}>
        {pool[1] ? (
          `${pool[1].toBigNumber().toFormat(0)} MKR`
        ) : (
          <Box sx={{ width: 6 }}>
            <Skeleton />
          </Box>
        )}
      </Text>
    </Flex>
  );

  return (
    <>
      <Box sx={{ display: ['none', 'block'] }} {...props}>
          <Heading as="h3" variant="microHeading" sx={{mb: 2, mt: 3}} >
            MKR Liquidity
          </Heading>
        <Card variant="compact">
          <Stack gap={3}>{mkrPools.map(p => PoolComponent(p))}</Stack>
        </Card>
      </Box>
    </>
  );
}