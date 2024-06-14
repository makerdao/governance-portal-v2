import { gql } from 'graphql-request';

export const delegateHistoryArray = gql`
query delegateHistoryArray($delegates: [String!]!) {
  delegates(where: {id_in: $delegates}) {
    delegationHistory {
      amount
      accumulatedAmount
      delegator
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
