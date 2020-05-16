import uniqBy from 'lodash.uniqby';
import matter from 'gray-matter';
import fetchRetry from 'fetch-retry';

import { markdownToHtml } from './utils';
import { CMS_ENDPOINTS } from './constants';
import getMaker, { getNetwork, MKR } from './maker';

export async function getExecutiveProposals() {
  const network = getNetwork();
  const topics = await (await fetch(CMS_ENDPOINTS[network])).json();
  return topics
    .filter(proposal => proposal.active)
    .filter(proposal => !proposal.govVote)
    .map(topic => topic.proposals)
    .flat();
}

export async function getPolls() {
  const maker = await getMaker();
  const pollsList = await maker.service('govPolling').getAllWhitelistedPolls();

  return (
    await Promise.all(
      uniqBy(pollsList, p => p.multiHash).map(async p => {
        const document = p.url
          ? await fetchRetry(fetch)(p.url, {
              retries: 3,
              retryDelay: 1000
            })
              .then(response => response.text())
              .catch(() => {
                console.log(`failed to fetch ${p.url} for poll ${p.pollId}`);
                return null;
              })
          : null;
        const pollMeta = matter(document)?.data || null;
        const content = matter(document)?.content || null;
        const summary = pollMeta?.summary || null;
        const title = pollMeta?.title || null;
        const options = pollMeta?.options || null;
        const discussionLink = pollMeta?.discussion_link || null;
        const voteType = pollMeta?.vote_type || null;
        return {
          ...p,
          startDate: `${p.startDate}`,
          endDate: `${p.endDate}`,
          content,
          summary,
          title,
          options,
          discussionLink,
          voteType
        };
      })
    )
  ).filter(p => !!p.summary && !!p.options && !!p.document);
}

export async function getPoll(pollHash) {
  const [poll] = (await getPolls()).filter(p => p.multiHash === pollHash);
  const content = await markdownToHtml(poll?.content || '');

  return {
    ...poll,
    content
  };
}

export async function getPollTally(pollId) {
  const network = getNetwork();
  const path = `/api/polling/tally?network=${network}&pollId=${pollId}`;
  const tally = await (await fetch(path)).json();
  const totalMkrParticipation = MKR(tally.totalMkrParticipation);
  return { ...tally, totalMkrParticipation };
}
