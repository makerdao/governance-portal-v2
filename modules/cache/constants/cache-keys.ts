/*

SPDX-FileCopyrightText: © 2023 Dai Foundation <www.daifoundation.org>

SPDX-License-Identifier: AGPL-3.0-or-later

*/

export const getPollTallyCacheKey = (pollId: number): string => `parsed-tally-${pollId}`;

export const executiveSupportersCacheKey = 'executive-supporters';

export const githubExecutivesCacheKey = 'executives-github';

export const delegatesGithubCacheKey = 'delegates-github';

export const allDelegatesExecSupportKey = 'all-delegates-exec-support';

export const allDelegateAddressesKey = 'all-delegate-addresses';

export const executiveProposalsCacheKey = 'proposals';

export const getDelegateGithubCacheKey = (address: string): string =>
  `delegate-github-${address.toLowerCase()}`;

export const getAddressDetailCacheKey = (address: string): string => `address-${address.toLowerCase()}`;

export const getExecutiveProposalsCacheKey = (
  start = 0,
  limit = 5,
  sortBy: 'date' | 'sky' | 'active' = 'active',
  startDate = 0,
  endDate = 0
): string => `proposals-${start}-${limit}-${sortBy}-${startDate}-${endDate}`;

export const getAddressStatsCacheKey = (address: string | string[]): string =>
  `address-stats-${Array.isArray(address) ? address.join('-') : address}`.toLowerCase();

export const getAddressDelegationHistoryCacheKey = (address: string): string =>
  `address-delegation-history-${address.toLowerCase()}`;

export const pollListCacheKey = 'poll-list';

export const partialActivePollsCacheKey = 'partial-active-polls';

export const pollDetailsCacheKey = 'poll-details';

export const pollTagsMappingJSONCacheKey = 'poll-tags-mapping';

export const getRecentlyUsedGaslessVotingKey = (address: string): string =>
  `recently-used-gasless-voting-${address.toLowerCase()}`;
