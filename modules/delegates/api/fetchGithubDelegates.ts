/*

SPDX-FileCopyrightText: © 2023 Dai Foundation <www.daifoundation.org>

SPDX-License-Identifier: AGPL-3.0-or-later

*/

import { matterWrapper } from 'lib/matter';
import { SupportedNetworks } from 'modules/web3/constants/networks';
import { cacheGet, cacheSet } from 'modules/cache/cache';
import { markdownToHtml } from 'lib/markdown';
import { DelegateListItem, DelegateRepoInformation, GithubDelegate } from 'modules/delegates/types';
import { getDelegatesIndexFileUrl, getMetadataRepoBaseUrl } from './getDelegatesRepositoryInfo';
import logger from 'lib/logger';
import { delegatesGithubCacheKey, getDelegateGithubCacheKey } from 'modules/cache/constants/cache-keys';
import { ONE_HOUR_IN_MS } from 'modules/app/constants/time';

// Parses the information on a delegate folder in github and extracts a DelegateRepoInformation parsed object
async function extractGithubInformation(
  delegateIndexData: GithubDelegate,
  network: SupportedNetworks
): Promise<DelegateRepoInformation | undefined> {
  try {
    const { path, metadata, metrics } = delegateIndexData;
    const baseUrl = getMetadataRepoBaseUrl(network);
    const profileUrl = `${baseUrl}/${path}`;
    const profileMdDoc = await (await fetch(profileUrl)).text();

    const { content } = matterWrapper(profileMdDoc);
    const html = await markdownToHtml(content);

    return {
      voteDelegateAddress: metadata.address,
      name: metadata.name,
      picture: metadata.avatar,
      externalUrl: metadata.external_profile_url,
      description: html,
      tags: metadata.tags,
      combinedParticipation: metrics.combined_participation,
      pollParticipation: metrics.poll_participation,
      executiveParticipation: metrics.exec_participation,
      communication: metrics.communication
    };
  } catch (e) {
    logger.error('extractGithubInformation: Error parsing folder from github delegate', e.message);
    return undefined;
  }
}

async function extractGithubDelegateListInformation(
  delegatesIndexData: GithubDelegate[]
): Promise<DelegateListItem[]> {
  return delegatesIndexData.map(delegate => {
    const { metadata, metrics } = delegate;

    return {
      voteDelegateAddress: metadata.address,
      picture: metadata.avatar,
      name: metadata.name,
      externalUrl: metadata.external_profile_url,
      combinedParticipation: metrics.combined_participation,
      pollParticipation: metrics.poll_participation,
      executiveParticipation: metrics.exec_participation,
      communication: metrics.communication,
      tags: metadata.tags
    };
  });
}
export async function fetchGithubDelegates(
  network: SupportedNetworks
): Promise<{ error: boolean; data?: DelegateListItem[] }> {
  const existingDelegates = await cacheGet(delegatesGithubCacheKey, network, ONE_HOUR_IN_MS);

  if (existingDelegates) {
    return Promise.resolve({
      error: false,
      data: JSON.parse(existingDelegates)
    });
  }

  try {
    const delegatesIndexUrl = getDelegatesIndexFileUrl(network);
    const delegatesIndexRes = await fetch(delegatesIndexUrl);

    // Check if the fetch was successful
    if (!delegatesIndexRes.ok) {
      logger.error(
        `fetchGithubDelegates: Failed to fetch delegates index. Status: ${delegatesIndexRes.status} ${delegatesIndexRes.statusText}`,
        'Network',
        network
      );
      return { error: true };
    }

    let delegatesIndexData: GithubDelegate[];
    try {
      // Attempt to parse the JSON response
      delegatesIndexData = await delegatesIndexRes.json();
    } catch (jsonError: any) {
      logger.error(
        'fetchGithubDelegates: Failed to parse delegates index JSON.',
        jsonError.message,
        'Network',
        network
      );
      return { error: true };
    }

    const data = await extractGithubDelegateListInformation(delegatesIndexData);

    // Store in cache
    cacheSet(delegatesGithubCacheKey, JSON.stringify(data), network, ONE_HOUR_IN_MS);

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
  const cacheKey = getDelegateGithubCacheKey(address);
  const existingDelegate = await cacheGet(cacheKey, network, ONE_HOUR_IN_MS);
  if (existingDelegate) {
    return Promise.resolve({
      error: false,
      data: JSON.parse(existingDelegate)
    });
  }

  try {
    // Fetch the aggregated index of the delegates folder
    const delegatesIndexUrl = getDelegatesIndexFileUrl(network);
    const delegatesIndexRes = await fetch(delegatesIndexUrl);

    // Check if the fetch was successful
    if (!delegatesIndexRes.ok) {
      logger.error(
        `fetchGithubDelegate: Failed to fetch delegates index. Status: ${delegatesIndexRes.status} ${delegatesIndexRes.statusText}`,
        'Network',
        network
      );
      return { error: true };
    }
    let delegatesIndexData: GithubDelegate[];
    try {
      // Attempt to parse the JSON response
      delegatesIndexData = await delegatesIndexRes.json();
    } catch (jsonError: any) {
      logger.error(
        'fetchGithubDelegate: Failed to parse delegates index JSON.',
        jsonError.message,
        'Network',
        network
      );
      return { error: true };
    }

    const delegateIndexData = delegatesIndexData.find(
      f => f.metadata.address.toLowerCase() === address.toLowerCase()
    );

    const userInfo = delegateIndexData
      ? await extractGithubInformation(delegateIndexData, network)
      : undefined;

    // Store in cache
    if (userInfo) {
      cacheSet(cacheKey, JSON.stringify(userInfo), network, ONE_HOUR_IN_MS);
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
