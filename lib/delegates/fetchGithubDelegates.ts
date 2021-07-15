import matter from 'gray-matter';
import { SupportedNetworks } from 'lib/constants';
import { fsCacheGet, fsCacheSet } from 'lib/fscache';
import { fetchGitHubPage, GithubPage } from 'lib/github';
import { markdownToHtml } from 'lib/utils';
import { DelegateRepoInformation } from 'types/delegate';
import { getDelegatesRepositoryInformation } from './getDelegatesRepositoryInfo';

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
      data: { name, url, profile_picture_url }
    } = matter(readmeDoc);

    const picture = folderContents.find(item => item.name.indexOf('profile') !== -1);
    const html = await markdownToHtml(content);

    return {
      voteDelegateAddress: folder.name,
      name,
      picture: picture ? picture.download_url : profile_picture_url,
      externalUrl: url,
      description: html
    };
  } catch (e) {
    console.error('Error parsing folder from github delegate', e.message);
    return undefined;
  }
}

export async function fetchGithubDelegates(
  network: SupportedNetworks
): Promise<{ error: boolean; data?: DelegateRepoInformation[] }> {
  const delegatesRepositoryInfo = getDelegatesRepositoryInformation(network);

  const delegatesCacheKey = `${network}-delegates`;
  const existingDelegates = fsCacheGet(delegatesCacheKey);

  if (existingDelegates) {
    return Promise.resolve({
      error: false,
      data: JSON.parse(existingDelegates)
    });
  }

  try {
    // Fetch all folders inside the delegates folder
    const folders = await fetchGitHubPage(
      delegatesRepositoryInfo.owner,
      delegatesRepositoryInfo.repo,
      delegatesRepositoryInfo.page
    );

    // Get the information of all the delegates, filter errored ones
    const promises = folders.map(
      async (folder): Promise<DelegateRepoInformation | undefined> => {
        return await extractGithubInformation(
          delegatesRepositoryInfo.owner,
          delegatesRepositoryInfo.repo,
          folder
        );
      }
    );

    const results = await Promise.all(promises);

    // Filter out negatives
    const data = results.filter(i => !!i) as DelegateRepoInformation[];

    // Store in cache
    fsCacheSet(delegatesCacheKey, JSON.stringify(data), 30000);

    return {
      error: false,
      data
    };
  } catch (e) {
    console.error('Error fetching Github delegates ', e.message, 'Network', network);
    return { error: true };
  }
}

export async function fetchGithubDelegate(
  address: string,
  network: SupportedNetworks
): Promise<{ error: boolean; data?: DelegateRepoInformation }> {
  const delegatesRepositoryInfo = getDelegatesRepositoryInformation(network);

  try {
    // Fetch all folders inside the delegates folder
    const folders = await fetchGitHubPage(
      delegatesRepositoryInfo.owner,
      delegatesRepositoryInfo.repo,
      delegatesRepositoryInfo.page
    );
    const folder = folders.find(f => f.name === address);

    const userInfo = folder
      ? await extractGithubInformation(delegatesRepositoryInfo.owner, delegatesRepositoryInfo.repo, folder)
      : undefined;

    return {
      error: false,
      data: userInfo
    };
  } catch (e) {
    console.error('Error fetching Github delegate ', address, e.message, 'Network: ', network);
    return { error: true };
  }
}
