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
    getBalancerMkr(),
    maker.service('token').getToken(MKR).balanceOf(uniswapV2MkrPool)
  ]);
}

type StatField = 'MKR in Aave' | 'MKR in Balancer' | 'MKR in Uniswap';

export default function SystemStatsSidebar({ fields = [], ...props }: { fields: StatField[] }): JSX.Element {
  const { data } = useSWR<CurrencyObject[]>('/mkr-liquidity', getMkrLiquidity, { refreshInterval: 60000 });
  const [aave, balancer, uniswap] = data || [];
  const statsMap = {
    'MKR in Aave': key => (
      <Flex key={key} sx={{ justifyContent: 'space-between', flexDirection: 'row' }}>
        <Text sx={{ fontSize: 3, color: 'textSecondary' }}>MKR in Aave</Text>
        <Text variant="h2" sx={{ fontSize: 3 }}>
          {aave ? (
            `${aave.toBigNumber().toFormat(0)} MKR`
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
          {balancer ? (
            `${balancer.toBigNumber().toFormat(0)} MKR`
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
        <Text sx={{ fontSize: 3, color: 'textSecondary' }}>MKR in Uniswap V2</Text>
        <Text variant="h2" sx={{ fontSize: 3 }}>
          {uniswap ? (
            `${uniswap.toBigNumber().toFormat(0)} MKR`
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