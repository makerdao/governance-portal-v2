import { config } from 'lib/config';
import { fsCacheGet, fsCacheSet } from 'lib/fscache';
import getMaker, { isTestnet } from 'lib/maker';
import { markdownToHtml } from 'lib/utils';
import invariant from 'tiny-invariant';
import { Poll } from 'modules/polls/types';
import mockPolls from './mocks/polls.json';
import { parsePollsMetadata } from './parsePollMetadata';
import { SupportedNetworks } from 'lib/constants';

export async function getPolls(network?: SupportedNetworks): Promise<Poll[]> {
  const maker = await getMaker(network);

  if (config.USE_FS_CACHE) {
    const cachedPolls = fsCacheGet('polls');
    if (cachedPolls) return JSON.parse(cachedPolls);
  } else if (config.NEXT_PUBLIC_USE_MOCK || isTestnet()) {
    return mockPolls.map(p => ({
      ...p,
      startDate: new Date(p.startDate),
      endDate: new Date(p.endDate)
    }));
  }

  const pollList = await maker.service('govPolling').getAllWhitelistedPolls();
  const polls = await parsePollsMetadata(pollList);

  if (config.USE_FS_CACHE) {
    fsCacheSet('polls', JSON.stringify(polls));
  }
  return polls;
}

  
export async function getPoll(slug: string): Promise<Poll> {
  const polls = await getPolls();
  const pollIndex = polls.findIndex(poll => poll.slug === slug);
  invariant(pollIndex > -1, `poll not found for poll slug ${slug}`);
  const [prev, next] = [polls?.[pollIndex - 1] || null, polls?.[pollIndex + 1] || null];

  return {
    ...polls[pollIndex],
    content: await markdownToHtml(polls[pollIndex].content),
    ctx: {
      prev,
      next
    }
  };
}
