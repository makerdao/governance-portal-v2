import { gql } from 'graphql-request';

export const allGithubDelegates = gql`
  query RepoFiles($owner: String!, $name: String!, $expression: String!) {
    repository(owner: $owner, name: $name) {
      object(expression: $expression) {
        ... on Tree {
          entries {
            ... on TreeEntry {
              name
              object {
                ... on Tree {
                  entries {
                    name
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
        }
      }
    }
  }
`;
