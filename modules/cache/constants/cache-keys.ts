export const getPollTallyCacheKey = (pollId: number): string => `parsed-tally-${pollId}`;

export const executiveSupportersCacheKey = 'executive-supporters';

export const githubExecutivesCacheKey = 'executives-github';

export const delegatesGithubCacheKey = 'delegates-github';

export const allDelegatesCacheKey = 'all-delegates';

export const executiveProposalsCacheKey = 'proposals';

export const getDelegateGithubCacheKey = (address: string) => `delegate-github-${address}`;

export const getAddressDetailCacheKey = (address: string): string => `address-${address}`;

export const getExecutiveProposalsCacheKey = (
  start = 0,
  limit = 5,
  sortBy: 'date' | 'mkr' | 'active' = 'active',
  startDate = 0,
  endDate = 0
): string => `proposals-${start}-${limit}-${sortBy}-${startDate}-${endDate}`;

export const getAddressStatsCacheKey = (address: string | string[]) =>
  `address-stats-${Array.isArray(address) ? address.join('-') : address}`;

export const getAddressDelegationHistoryCacheKey = (address: string) =>
  `address-delegation-history-${address}`;

export const getAllPollsCacheKey = (filters?: any): string =>
  `polls-${filters ? JSON.stringify(filters) : 'all'}`;

export const pollTagsMappingJSONCacheKey = 'poll-tags-mapping';

export const getRecentlyUsedGaslessVotingKey = (address: string): string =>
  `recently-used-gasless-voting-${address}`;
