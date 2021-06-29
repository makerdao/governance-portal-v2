import { Octokit } from '@octokit/core';

// Handle errors of configuration by disabling oktokit

let octokit;
try {
  octokit = new Octokit({ auth: process.env.GITHUB_TOKEN });
} catch(e) {
  console.warn('WARNING: GitHub token not configured correctly. Vote delegates will not be fetcheed')
}

export type GithubPage = {
  name: string;
  path: string;
  url: string;
  download_url: string;
  type: string;
};

export async function fetchGitHubPage(owner: string, repo: string, path: string): Promise<GithubPage[]> {
  if (!octokit) {
    return Promise.resolve([]);
  }

  const { data } = await octokit.request('GET /repos/{owner}/{repo}/contents/{path}', {
    owner,
    repo,
    path
  });

  return data;
}