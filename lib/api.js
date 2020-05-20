import uniqBy from 'lodash.uniqby';
import matter from 'gray-matter';
import fetchRetry from 'fetch-retry';
import validUrl from 'valid-url';

import { markdownToHtml, timeoutPromise } from './utils';
import { CMS_ENDPOINTS } from './constants';
import getMaker, { getNetwork, MKR } from './maker';

let _cachedProposals;
export async function getExecutiveProposals({ useCache = false } = {}) {
  if (useCache && _cachedProposals) return _cachedProposals;
  const network = getNetwork();
  const topics = await (await fetch(CMS_ENDPOINTS[network])).json();
  const proposals = topics
    .filter(proposal => proposal.active)
    .filter(proposal => !proposal.govVote)
    .map(topic => topic.proposals)
    .flat();

  _cachedProposals = proposals;
  return proposals;
}

export async function getExecutiveProposal(
  proposalId,
  { useCache = false } = {}
) {
  const proposals =
    useCache && _cachedProposals
      ? _cachedProposals
      : await getExecutiveProposals();
  const proposal = proposals.find(proposal => proposal.key === proposalId);
  const content = await markdownToHtml(proposal?.about || '');

  return {
    ...proposal,
    content
  };
}

let _cachedPolls;
export async function getPolls({ useCache = false } = {}) {
  if (useCache && _cachedPolls) return _cachedPolls;

  const maker = await getMaker();
  const pollsList = await maker.service('govPolling').getAllWhitelistedPolls();

  const polls = await Promise.all(
    uniqBy(pollsList, p => p.multiHash).map(async p => {
      let document = '';
      try {
        document =
          validUrl.isUri(p.url) &&
          (await timeoutPromise(
            5000, // reject if it takes longer than this to fetch
            fetchRetry(fetch)(p.url, {
              retries: 3,
              retryDelay: 1000
            })
          ).then(response => response?.text()));
      } catch (err) {
        console.log(
          `unable to fetch poll content from ${p.url} for poll ${p.pollId}`
        );
      }

      const pollMeta = matter(document || '')?.data || null;
      const content = matter(document || '')?.content || null;
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
  ).then(polls =>
    polls
      .filter(p => !!p.summary && !!p.options)
      .sort(
        (
          a,
          b // newest to oldest
        ) => new Date(b.startDate).getTime() - new Date(a.startDate).getTime()
      )
  );

  _cachedPolls = polls;
  return polls;
}

export async function getPoll(pollHash, { useCache = false } = {}) {
  const polls = useCache && _cachedPolls ? _cachedPolls : await getPolls();
  const [poll] = polls.filter(p => p.multiHash === pollHash);
  const content = await markdownToHtml(poll?.content || '');

  return {
    ...poll,
    content
  };
}

export async function getPollTally(pollId) {
  const network = getNetwork();
  const path = `/api/polling/tally/${pollId}?network=${network}`;
  const tally = await (await fetch(path)).json();
  const totalMkrParticipation = MKR(tally.totalMkrParticipation);
  Object.keys(tally.options).forEach(key => {
    tally.options[key].firstChoice = MKR(tally.options[key].firstChoice);
    tally.options[key].transfer = MKR(tally.options[key].transfer);
  });
  return { ...tally, totalMkrParticipation };
}
