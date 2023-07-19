/*

SPDX-FileCopyrightText: © 2023 Dai Foundation <www.daifoundation.org>

SPDX-License-Identifier: AGPL-3.0-or-later

*/

import { ONE_HOUR_IN_MS } from 'modules/app/constants/time';
import { Avc, AvcsAPIResponse, AvcsValidatedQueryParams } from '../types/avc';
import { getAvcsRepositoryInformation } from './getAvcsRepositoryInfo';
import { avcsCacheKey } from 'modules/cache/constants/cache-keys';
import { cacheGet, cacheSet } from 'modules/cache/cache';
import { fetchGithubGraphQL } from 'lib/github';
import { allGithubAvcs } from 'modules/gql/queries/allGithubAvcs';
import logger from 'lib/logger';
import { GraphQlQueryResponseData } from '@octokit/graphql';
import { RepositoryInfo } from 'modules/delegates/api/getDelegatesRepositoryInfo';
import matter from 'gray-matter';
import { markdownToHtml } from 'lib/markdown';
import { AvcOrderByEnum } from '../avcs.constants';

// Parses the information on an AVC folder in GitHub and extracts an Avc parsed object
async function extractGithubInformationGraphQL(
  data: GraphQlQueryResponseData,
  avcsRepositoryInfo: RepositoryInfo
): Promise<Avc[]> {
  const entries = data.repository.object.entries;
  const promises = entries
    .filter(({ name }) => name !== 'base-template')
    .map(async avcEntry => {
      const folderContents = avcEntry.object.entries;
      const profileMd = folderContents.find(item => item.name === 'profile.md');

      // No profile found
      if (!profileMd) {
        return undefined;
      }

      const profileMdDoc = profileMd?.object?.text;

      const {
        content,
        data: { external_profile_url, avc_name }
      } = matter(profileMdDoc);
      const html = await markdownToHtml(content);
      const avcDescription = html.split('<h1>$delegate_name</h1>')[0];

      const picture = folderContents.find(item => item.name.indexOf('avatar') !== -1);

      return {
        id: avcEntry.name,
        name: avc_name,
        picture: picture
          ? `https://github.com/${avcsRepositoryInfo.owner}/${avcsRepositoryInfo.repo}/raw/master/${picture.path}`
          : undefined,
        externalUrl: external_profile_url,
        description: avcDescription
      };
    });

  const avcsInfo = await Promise.all(promises);
  return avcsInfo;
}

export async function fetchAvcs({
  network,
  orderBy,
  searchTerm
}: AvcsValidatedQueryParams): Promise<AvcsAPIResponse> {
  const existingAvcs = await cacheGet(avcsCacheKey, network, ONE_HOUR_IN_MS);

  let avcs: Avc[];

  if (existingAvcs) avcs = JSON.parse(existingAvcs);
  else {
    const avcsRepositoryInfo = getAvcsRepositoryInformation(network);

    try {
      const allAvcs = await fetchGithubGraphQL(avcsRepositoryInfo, allGithubAvcs);
      const results = await extractGithubInformationGraphQL(allAvcs, avcsRepositoryInfo);

      // Filter out negatives
      const data = results.filter(i => !!i);

      // Store in cache
      cacheSet(avcsCacheKey, JSON.stringify(data), network, ONE_HOUR_IN_MS);

      avcs = data;
    } catch (e) {
      logger.error('fetchAvcs: Error fetching Github AVCs\n', e.message, '\nNetwork', network);
      avcs = [];
    }
  }

  // Apply filters and sort AVCs
  const filteredAvcs = avcs
    .filter(avc => (!searchTerm ? avc : avc.name.toLowerCase().includes(searchTerm.toLowerCase())))
    .sort((a, b) =>
      orderBy === AvcOrderByEnum.DELEGATES
        ? // Order by delegate count descending
          b.delegateCount - a.delegateCount
        : orderBy === AvcOrderByEnum.MKR_DELEGATED
        ? // Order by MKR delegated descending
          +b.mkrDelegated - +a.mkrDelegated
        : // Order randomly
          Math.random() - 0.5
    );

  return {
    stats: {
      totalCount: avcs.length
    },
    avcs: filteredAvcs
  };
}
