/*

SPDX-FileCopyrightText: © 2023 Dai Foundation <www.daifoundation.org>

SPDX-License-Identifier: AGPL-3.0-or-later

*/

import { SupportedNetworks } from 'modules/web3/constants/networks';
import { cacheGet, cacheSet } from 'modules/cache/cache';
import { fetchGitHubPage } from 'lib/github';
import { markdownToHtml } from 'lib/markdown';
import { DelegateRepoInformation } from 'modules/delegates/types';
import { getDelegatesRepositoryInformation } from './getDelegatesRepositoryInfo';
import logger from 'lib/logger';
import { delegatesGithubCacheKey, getDelegateGithubCacheKey } from 'modules/cache/constants/cache-keys';
import { ONE_HOUR_IN_MS } from 'modules/app/constants/time';


export async function fetchGithubDelegates(
  network: SupportedNetworks
): Promise<{ error: boolean; data?: DelegateRepoInformation[] }> {
  const delegatesRepositoryInfo = getDelegatesRepositoryInformation(network);

  const existingDelegates = await cacheGet(delegatesGithubCacheKey, network, ONE_HOUR_IN_MS);

  if (existingDelegates) {
    return Promise.resolve({
      error: false,
      data: JSON.parse(existingDelegates)
    });
  }

  try {
    const delegatesRawData = (await fetchGitHubPage(
      delegatesRepositoryInfo.owner,
      delegatesRepositoryInfo.repo,
      delegatesRepositoryInfo.page
    )) as any as string;

    const parsed = JSON.parse(delegatesRawData);

    const allDelegates = await Promise.all(parsed.delegates.map(async d => {
      const htmlDescription = await markdownToHtml(d.profile ? d.profile.description: '');
      return {
        name: d.profile ? d.profile.name : '',
        voteDelegateAddress: d.voteDelegateAddress,
        picture: d.image,
        externalUrl: d.profile ? d.profile.externalProfileURL : '',
        description: htmlDescription,
        tags: d.profile ? d.profile.tags : [],
        combinedParticipation: d.metrics ? d.metrics.combinedParticipation : null,
        pollParticipation: d.metrics ? d.metrics.pollParticipation : null,
        executiveParticipation: d.metrics ? d.metrics.executiveParticipation : null,
        communication: d.metrics ? d.metrics.communication : null,
        cuMember: d.cuMember
      };
    }));

    // Store in cache
    cacheSet(delegatesGithubCacheKey, JSON.stringify(allDelegates), network, ONE_HOUR_IN_MS);

    return {
      error: false,
      data: allDelegates
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
    // Fetch all folders inside the delegates folder
    const allDelegates = await fetchGithubDelegates(network);

    if (!allDelegates.data) {
      throw new Error('No delegates found');
    }

    const delegate = allDelegates.data.find(f => f.voteDelegateAddress.toLowerCase() === address.toLowerCase());


    // Store in cache
    if (delegate) {
      cacheSet(cacheKey, JSON.stringify(delegate), network, ONE_HOUR_IN_MS);
    }

    return {
      error: false,
      data: delegate
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
