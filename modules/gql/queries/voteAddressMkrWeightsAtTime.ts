import { gql } from 'graphql-request';

export const voteAddressMkrWeightsAtTime = gql`
  query voteAddressMkrWeightsAtTime($argPollId: Int!, $argUnix: Int!) {
    voteAddressMkrWeightsAtTime(argPollId: $argPollId, argUnix: $argUnix) {
      nodes {
        voter
        optionIdRaw
        mkrSupport
        chainId
        blockTimestamp
        hash
      }
    }
  }
`;
