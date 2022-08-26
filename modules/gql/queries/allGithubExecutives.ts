import { gql } from 'graphql-request';

export const allGithubExecutives = gql`
  query RepoFiles($owner: String!, $name: String!, $expression: String!) {
    repository(owner: $owner, name: $name) {
      object(expression: $expression) {
        ... on Tree {
          entries {
            name
            type
            path
            object {
              ... on Blob {
                text
              }
            }
          }
        }
      }
    }
  }
`;
