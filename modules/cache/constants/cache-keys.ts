export const getPollTallyCacheKey = (pollId: number) => `parsed-tally-${pollId}`;

export const executiveSupportersCacheKey = 'executive-supporters';

export const githubExecutivesCacheKey = 'executives-github';

export const delegatesCacheKey = 'delegates';

export const getAllPollsCacheKey = (filters?: any) => `polls-${filters ? JSON.stringify(filters) : 'all'}`;

export const pollTagsMappingJSONCacheKey = 'poll-tags-mapping';
