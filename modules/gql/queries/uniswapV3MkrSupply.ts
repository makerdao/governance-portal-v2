import { gql } from 'graphql-request';

export const uniswapV3MkrSupply = gql`
  query uniswapV3MkrSupply($argMkrAddress: String!) {
    token(id: $argMkrAddress) {
      symbol
      totalValueLocked
    }
  }
`;
