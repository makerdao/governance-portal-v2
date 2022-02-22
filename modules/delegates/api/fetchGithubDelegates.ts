import matter from 'gray-matter';
import { SupportedNetworks } from 'lib/constants';
import { fsCacheGet, fsCacheSet } from 'lib/fscache';
import { fetchGitHubPage, GithubPage } from 'lib/github';
import { markdownToHtml } from 'lib/utils';
import { DelegateRepoInformation } from 'modules/delegates/types';
import { getDelegatesRepositoryInformation } from './getDelegatesRepositoryInfo';

// Parses the information on a delegate folder in github and extracts a DelegateRepoInformation parsed object
async function extractGithubInformation(
  owner: string,
  repo: string,
  folder: GithubPage
): Promise<DelegateRepoInformation | undefined> {
  try {
    const folderContents = await fetchGitHubPage(owner, repo, folder.path);

    const profileMd = folderContents.find(item => item.name === 'profile.md');

    const metricsMd = folderContents.find(item => item.name === 'metrics.md');

    // No profile found
    if (!profileMd) {
      return undefined;
    }

    const profileMdDoc = await (await fetch(profileMd?.download_url)).text();

    let metricsMdDoc;
    if (metricsMd) {
      metricsMdDoc = await (await fetch(metricsMd?.download_url)).text();
    }

    const {
      content,
      data: { name, external_profile_url }
    } = matter(profileMdDoc);

    const {
      data: { combined_participation, communication, poll_participation, exec_participation }
    } = matter(metricsMdDoc);

    const picture = folderContents.find(item => item.name.indexOf('avatar') !== -1);
    const html = await markdownToHtml(content);

    return {
      voteDelegateAddress: folder.name,
      name,
      picture: picture ? picture.download_url : undefined,
      externalUrl: external_profile_url,
      description: html,
      combinedParticipation: combined_participation,
      pollParticipation: poll_participation,
      executiveParticipation: exec_participation,
      communication
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

  const delegatesCacheKey = 'delegates';
  const cacheTime = 1000 * 60 * 60;
  const existingDelegates = fsCacheGet(delegatesCacheKey, network, cacheTime);

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
    const promises = folders.map(async (folder): Promise<DelegateRepoInformation | undefined> => {
      return await extractGithubInformation(
        delegatesRepositoryInfo.owner,
        delegatesRepositoryInfo.repo,
        folder
      );
    });

    const results = await Promise.all(promises);

    // Filter out negatives
    const data = results.filter(i => !!i) as DelegateRepoInformation[];

    // Store in cache
    fsCacheSet(delegatesCacheKey, JSON.stringify(data), network, cacheTime);

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

  const delegatesCacheKey = `delegate-${address}`;
  const cacheTime = 1000 * 60 * 60;
  const existingDelegate = fsCacheGet(delegatesCacheKey, network, cacheTime);

  if (existingDelegate) {
    return Promise.resolve({
      error: false,
      data: JSON.parse(existingDelegate)
    });
  }

  try {
    // Fetch all folders inside the delegates folder
    const folders = await fetchGitHubPage(
      delegatesRepositoryInfo.owner,
      delegatesRepositoryInfo.repo,
      delegatesRepositoryInfo.page
    );
    const folder = folders.find(f => f.name.toLowerCase() === address.toLowerCase());

    const userInfo = folder
      ? await extractGithubInformation(delegatesRepositoryInfo.owner, delegatesRepositoryInfo.repo, folder)
      : undefined;

    // Store in cache
    fsCacheSet(delegatesCacheKey, JSON.stringify(userInfo), network, cacheTime);

    return {
      error: false,
      data: userInfo
    };
  } catch (e) {
    console.error('Error fetching Github delegate ', address, e.message, 'Network: ', network);
    return { error: true };
  }
}
