import { gql } from 'graphql-request';

export const voteMkrWeightsAtTimeRankedChoice = gql`
  query voteMkrWeightsAtTimeRankedChoice($argPollId: Int!, $argUnix: Int!) {
    voteMkrWeightsAtTimeRankedChoice(argPollId: $argPollId, argUnix: $argUnix) {
      nodes {
        optionIdRaw
        mkrSupport
      }
    }
  }
`;
