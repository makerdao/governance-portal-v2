import matter from 'gray-matter';
import { fetchGitHubPage, GithubPage } from 'lib/github';
import { markdownToHtml } from 'lib/utils';
import { DelegateRepoInformation } from 'types/delegate';

// Parses the information on a delegate folder in github and extracts a DelegateRepoInformation parsed object
async function extractGithubInformation(
  owner: string,
  repo: string,
  folder: GithubPage
): Promise<DelegateRepoInformation | undefined> {
  try {
    const folderContents = await fetchGitHubPage(owner, repo, folder.path);

    const readme = folderContents.find(item => item.name === 'README.md');

    // No readme found
    if (!readme) {
      return undefined;
    }

    const readmeDoc = await (await fetch(readme?.download_url)).text();

    const {
      content,
      data: { name, url }
    } = matter(readmeDoc);

    const picture = folderContents.find(item => item.name.indexOf('profile') !== -1);
    const html = await markdownToHtml(content);

    return {
      voteDelegateAddress: folder.name,
      name,
      picture: picture ? picture.download_url : '',
      externalUrl: url,
      description: html
    };
  } catch (e) {
    console.error('Error parsing folder from github delegate', e.message);
    return undefined;
  }
}

export async function fetchGithubDelegates(): Promise<{ error: boolean; data?: DelegateRepoInformation[] }> {
  const owner = process.env.GITHUB_DELEGATES_OWNER || 'makerdao-dux';
  const repo = process.env.GITHUB_DELEGATES_REPO || 'voting-delegates';
  const page = 'delegates';

  try {
    // Fetch all folders inside the delegates folder
    const folders = await fetchGitHubPage(owner, repo, page);

    // Get the information of all the delegates, filter errored ones
    const promises = folders.map(
      async (folder): Promise<DelegateRepoInformation | undefined> => {
        return await extractGithubInformation(owner, repo, folder);
      }
    );

    const results = await Promise.all(promises);

    // Filter out negatives
    const data = results.filter(i => !!i) as DelegateRepoInformation[];
    return {
      error: false,
      data
    };
  } catch (e) {
    console.error('Error fetching Github delegates ', e.message);
    return { error: true };
  }
}

export async function fetchGithubDelegate(
  address: string
): Promise<{ error: boolean; data?: DelegateRepoInformation }> {
  const owner = process.env.GITHUB_DELEGATES_OWNER || 'makerdao-dux';
  const repo = process.env.GITHUB_DELEGATES_REPO || 'voting-delegates';
  const page = 'delegates';

  try {
    // Fetch all folders inside the delegates folder
    const folders = await fetchGitHubPage(owner, repo, page);
    const folder = folders.find(f => f.name === address);

    const userInfo = folder ? await extractGithubInformation(owner, repo, folder) : undefined;

    return {
      error: false,
      data: userInfo
    };
  } catch (e) {
    console.error('Error fetching Github delegate ', address, e.message);
    return { error: true };
  }
}
