import matter from 'gray-matter';
import { GraphQlQueryResponseData } from '@octokit/graphql';
import { SupportedNetworks } from 'modules/web3/constants/networks';
import { cacheGet, cacheSet } from 'lib/cache';
import { fetchGithubGraphQL, fetchGitHubPage, GithubPage, GithubTokens } from 'lib/github';
import { markdownToHtml } from 'lib/markdown';
import { DelegateRepoInformation } from 'modules/delegates/types';
import { getDelegatesRepositoryInformation } from './getDelegatesRepositoryInfo';
import { ethers } from 'ethers';
import { allGithubDelegates } from 'modules/gql/queries/allGithubDelegates';
import logger from 'lib/logger';

// Parses the information on a delegate folder in github and extracts a DelegateRepoInformation parsed object
async function extractGithubInformation(
  owner: string,
  repo: string,
  folder: GithubPage
): Promise<DelegateRepoInformation | undefined> {
  try {
    const folderContents = await fetchGitHubPage(owner, repo, folder.path, GithubTokens.Delegate);

    const profileMd = folderContents.find(item => item.name === 'profile.md');

    const metricsMd = folderContents.find(item => item.name === 'metrics.md');

    const cuMemberMd = folderContents.find(item => item.name === 'cumember.md');

    // No profile found
    if (!profileMd) {
      return undefined;
    }

    const profileMdDoc = await (await fetch(profileMd?.download_url)).text();

    const {
      content,
      data: { name, external_profile_url, tags }
    } = matter(profileMdDoc);

    let metricsMdDoc;
    let metricsData;
    if (metricsMd) {
      metricsMdDoc = await (await fetch(metricsMd?.download_url)).text();
      const { data } = matter(metricsMdDoc);
      metricsData = data;
    }

    let cuMember = false;
    if (cuMemberMd) {
      cuMember = true;
    }

    const picture = folderContents.find(item => item.name.indexOf('avatar') !== -1);
    const html = await markdownToHtml(content);
    return {
      voteDelegateAddress: folder.name,
      name,
      picture: picture ? picture.download_url : undefined,
      externalUrl: external_profile_url,
      description: html,
      tags,
      combinedParticipation: metricsData.combined_participation,
      pollParticipation: metricsData.poll_participation,
      executiveParticipation: metricsData.exec_participation,
      communication: metricsData.communication,
      cuMember
    };
  } catch (e) {
    logger.error('extractGithubInformation: Error parsing folder from github delegate', e.message);
    return undefined;
  }
}

async function extractGithubInformationGraphQL(
  data: GraphQlQueryResponseData
): Promise<DelegateRepoInformation[]> {
  const entries = data.repository.object.entries;
  const promises = entries
    // Our query returns extraneous files in the delegates folder, but we only want addresses
    .filter(({ name }) => ethers.utils.isAddress(name))
    .map(async delegateEntry => {
      const voteDelegateAddress = delegateEntry.name;

      const folderContents = delegateEntry.object.entries;
      const profileMd = folderContents.find(item => item.name === 'profile.md');

      const metricsMd = folderContents.find(item => item.name === 'metrics.md');

      const cuMemberMd = folderContents.find(item => item.name === 'cumember.md');

      // No profile found
      if (!profileMd) {
        return undefined;
      }

      const profileMdDoc = profileMd?.object?.text;

      const {
        content,
        data: { name, external_profile_url, tags }
      } = matter(profileMdDoc);

      const metricsMdDoc = metricsMd?.object?.text;
      const { data } = matter(metricsMdDoc);
      const metricsData = data;

      let cuMember = false;
      if (cuMemberMd) {
        cuMember = true;
      }

      const picture = folderContents.find(item => item.name.indexOf('avatar') !== -1);
      const html = await markdownToHtml(content);
      const vd = {
        voteDelegateAddress,
        name,

        // The graphql api unfortunately does not return the download_url or raw url for blobs/images. In this case we have to manually construct the delegate avatar picture url
        // In case the delegate repository gets migrated, reconsider this approach
        picture: picture ? `https://github.com/makerdao/community/raw/master/${picture.path}` : undefined,
        externalUrl: external_profile_url,
        description: html,
        tags,
        combinedParticipation: metricsData.combined_participation,
        pollParticipation: metricsData.poll_participation,
        executiveParticipation: metricsData.exec_participation,
        communication: metricsData.communication,
        cuMember
      };
      return vd;
    });
  const delegatesInfo = await Promise.all(promises);
  return delegatesInfo;
}
export async function fetchGithubDelegates(
  network: SupportedNetworks
): Promise<{ error: boolean; data?: DelegateRepoInformation[] }> {
  const delegatesRepositoryInfo = getDelegatesRepositoryInformation(network);

  const delegatesCacheKey = 'delegates';
  const cacheTime = 1000 * 60 * 60;
  const existingDelegates = await cacheGet(delegatesCacheKey, network, cacheTime);

  if (existingDelegates) {
    return Promise.resolve({
      error: false,
      data: JSON.parse(existingDelegates)
    });
  }

  try {
    const allDelegates = await fetchGithubGraphQL(
      delegatesRepositoryInfo,
      allGithubDelegates,
      GithubTokens.DelegatesFolder
    );

    const results = await extractGithubInformationGraphQL(allDelegates);

    // Filter out negatives
    const data = results.filter(i => !!i) as DelegateRepoInformation[];

    // Store in cache
    cacheSet(delegatesCacheKey, JSON.stringify(data), network, cacheTime);

    return {
      error: false,
      data
    };
  } catch (e) {
    logger.error('fetchGithubDelegates: Error fetching Github delegates ', e.message, 'Network', network);
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
  const existingDelegate = await cacheGet(delegatesCacheKey, network, cacheTime);
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
      delegatesRepositoryInfo.page,
      GithubTokens.DelegatesFolder
    );
    const folder = folders.find(f => f.name.toLowerCase() === address.toLowerCase());

    const userInfo = folder
      ? await extractGithubInformation(delegatesRepositoryInfo.owner, delegatesRepositoryInfo.repo, folder)
      : undefined;

    // Store in cache
    if (userInfo) {
      cacheSet(delegatesCacheKey, JSON.stringify(userInfo), network, cacheTime);
    }

    return {
      error: false,
      data: userInfo
    };
  } catch (e) {
    logger.error(
      'fetchGithubDelegate: Error fetching Github delegate ',
      address,
      e.message,
      'Network: ',
      network
    );
    return { error: true };
  }
}
