import { Octokit } from '@octokit/core';
import { GraphQlQueryResponseData } from '@octokit/graphql';
import { config } from 'lib/config';
import { RepositoryInfo } from 'modules/delegates/api/getDelegatesRepositoryInfo';

// Handle errors of configuration by disabling oktokit

export enum GithubTokens {
  Delegate = 1,
  DelegatesFolder = 2,
  Executives = 3
}

const token1 = config.GITHUB_TOKEN;
const token2 = config.GITHUB_TOKEN_2 ? config.GITHUB_TOKEN_2 : config.GITHUB_TOKEN;
const token3 = config.GITHUB_TOKEN_3 ? config.GITHUB_TOKEN_3 : config.GITHUB_TOKEN;

export const octokits = new Array(Object.keys(GithubTokens).length / 2);

try {
  octokits[0] = new Octokit({ auth: token1 });
  octokits[1] = new Octokit({ auth: token2 });
  octokits[2] = new Octokit({ auth: token3 });
} catch (e) {
  console.warn(
    'WARNING: GitHub token not configured correctly. Vote delegates and/or executives will not be fetched'
  );
}

export type GithubPage = {
  name: string;
  path: string;
  url: string;
  download_url: string;
  type: string;
};

export async function fetchGitHubPage(
  owner: string,
  repo: string,
  path: string,
  tokenNum: GithubTokens
): Promise<GithubPage[]> {
  if (!octokits[tokenNum - 1]) {
    return Promise.resolve([]);
  }

  const { data } = await octokits[tokenNum - 1].request('GET /repos/{owner}/{repo}/contents/{path}', {
    owner,
    repo,
    path
  });

  return data;
}

export async function fetchGithubGraphQL(
  { owner, repo, page }: RepositoryInfo,
  query: string,
  tokenNum: GithubTokens
): Promise<GraphQlQueryResponseData> {
  if (!octokits[tokenNum - 1]) {
    return Promise.resolve([]);
  }
  const octokit = octokits[tokenNum - 1];
  const data = await octokit.graphql(query, { owner, name: repo, expression: `master:${page}` });
  return data;
}
