import { gql } from 'graphql-request';

export const delegateHistoryArray = gql`
query delegateHistoryArray($delegates: [String!]!) {
  delegates(where: {id_in: $delegates}) {
    id
    delegationHistory {
      id
      amount
      accumulatedAmount
      blockNumber
      timestamp
      txnHash
      delegate {
        id
      }
    }
  }
}
`;
