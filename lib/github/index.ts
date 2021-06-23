import { Octokit } from '@octokit/core';

const octokit = new Octokit({ auth: process.env.GITHUB_TOKEN });

type GithubPage = {
  name: string;
  path: string;
  url: string;
  download_url: string;
};

export async function fetchPage(owner: string, repo: string, path: string): Promise<[GithubPage]> {
  const { data } = await octokit.request('GET /repos/{owner}/{repo}/contents/{path}', {
    owner,
    repo,
    path
  });

  return data;
}
