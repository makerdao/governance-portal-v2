import { Octokit } from '@octokit/core';
import { config } from 'lib/config';

// Handle errors of configuration by disabling oktokit

const token1 = config.GITHUB_TOKEN;
const token2 = config.GITHUB_TOKEN_2 ? config.GITHUB_TOKEN_2 : config.GITHUB_TOKEN;
const token3 = config.GITHUB_TOKEN_3 ? config.GITHUB_TOKEN_3 : config.GITHUB_TOKEN;
const token4 = config.GITHUB_TOKEN_4 ? config.GITHUB_TOKEN_4 : config.GITHUB_TOKEN;

let octokits;
try {
  octokits[0] = new Octokit({ auth: token1 });
  octokits[1] = new Octokit({ auth: token2 });
  octokits[2] = new Octokit({ auth: token3 });
  octokits[3] = new Octokit({ auth: token4 });
} catch (e) {
  console.warn('WARNING: GitHub token not configured correctly. Vote delegates and/or executives will not be fetched');
}

export type GithubPage = {
  name: string;
  path: string;
  url: string;
  download_url: string;
  type: string;
};

export async function fetchGitHubPage(owner: string, repo: string, path: string, tokenNum: number): Promise<GithubPage[]> {
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
