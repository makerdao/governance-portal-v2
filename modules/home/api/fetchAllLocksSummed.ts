import { gql } from 'graphql-request';
import { gqlRequest } from 'modules/gql/gqlRequest';

// 1633742399 six months ago
// 1617931199 one year ago
export const allLocksSummed = gql`
  {
    allLocksSummed(unixtimeStart: 1617931199, unixtimeEnd: 1649435010) {
      nodes {
        fromAddress
        immediateCaller
        lockAmount
        blockNumber
        blockTimestamp
        lockTotal
        hash
      }
    }
  }
`;

export default async function fetchAllLocksSummed() {
  const data = await gqlRequest({
    chainId: 1,
    query: allLocksSummed,
    uri: 'https://9cc9-24-8-30-196.ngrok.io/v1'
  });

  return data;
}
