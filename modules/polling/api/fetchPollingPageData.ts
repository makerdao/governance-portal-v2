/*

SPDX-FileCopyrightText: © 2023 Dai Foundation <www.daifoundation.org>

SPDX-License-Identifier: AGPL-3.0-or-later

*/

import { getPolls } from 'modules/polling/api/fetchPolls';
import { Poll } from 'modules/polling/types';
import { SupportedNetworks } from 'modules/web3/constants/networks';
import { fetchJson } from 'lib/fetchJson';
import { TagCount } from 'modules/app/types/tag';

export type PollingReviewPageData = {
  polls: Poll[];
};

export type PollingPageData = {
  polls: Poll[];
  tags: TagCount[];
};

export async function fetchPollingPageData(
  network: SupportedNetworks,
  useApi = false
): Promise<PollingPageData> {
  const pollsData = useApi
    ? await fetchJson(`/api/polling/all-polls?network=${network}`)
    : await getPolls(undefined, network);

  return {
    polls: (pollsData as PollingPageData).polls,
    tags: (pollsData as PollingPageData).tags
  };
}
