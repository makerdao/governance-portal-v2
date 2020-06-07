import uniqBy from 'lodash.uniqby';
import matter from 'gray-matter';
import validUrl from 'valid-url';
import invariant from 'tiny-invariant';

import { markdownToHtml, timeoutPromise, backoffRetry } from './utils';
import { CMS_ENDPOINTS, GOV_BLOG_POSTS_ENDPOINT } from './constants';
import getMaker, { getNetwork } from './maker';
import Poll from '../types/poll';
import Proposal from '../types/proposal';
import BlogPost from '../types/blogPost';
import VoteTypes from '../types/voteTypes';

let _cachedProposals: Proposal[];
/**
 * The first time this method is called, it fetches fresh proposals and caches them.
 * Everytime after that, it returns from the cache.
 */
export async function getExecutiveProposals(): Promise<Proposal[]> {
  if (_cachedProposals) return _cachedProposals;
  const network = getNetwork();
  invariant(network in CMS_ENDPOINTS, `no cms endpoint known for network ${network}`);
  const topics = await (await fetch(CMS_ENDPOINTS[network])).json();
  const proposals = topics
    .filter(proposal => proposal.active)
    .filter(proposal => !proposal.govVote)
    .map(topic => topic.proposals)
    .flat();

  return (_cachedProposals = proposals);
}

export async function getExecutiveProposal(proposalId: string): Promise<Proposal> {
  const proposals = await getExecutiveProposals();
  const proposal = proposals.find(proposal => proposal.key === proposalId);
  invariant(proposal, `proposal not found for proposal id ${proposalId}`);
  const content = await markdownToHtml(proposal.about || '');

  return {
    ...proposal,
    content
  };
}

let _cachedPolls: Poll[];
/**
 * The first time this method is called, it fetches fresh polls and caches them.
 * Everytime after that, it returns from the cache.
 */
export async function getPolls(): Promise<Poll[]> {
  if (_cachedPolls) return _cachedPolls;

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
            backoffRetry(3, () => fetch(p.url))
          ).then(response => response?.text()));
      } catch (err) {
        console.log(`unable to fetch poll content from ${p.url} for poll ${p.pollId}`);
      }

      const pollMeta = matter(document || '').data;
      const content = matter(document || '')?.content || '';
      const summary = pollMeta?.summary || '';
      const title = pollMeta?.title || '';
      const options = pollMeta?.options || null;
      const discussionLink =
        pollMeta?.discussion_link && validUrl.isUri(pollMeta.discussion_link)
          ? pollMeta.discussion_link
          : null;
      const voteType: VoteTypes =
        (pollMeta as { vote_type: VoteTypes | null })?.vote_type || 'Plurality Voting'; // compiler error if invalid vote type
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
    (polls as any[])
      .filter(p => !!p.summary && !!p.options)
      // newest to oldest
      .sort((a, b) => new Date(b.startDate).getTime() - new Date(a.startDate).getTime())
  );

  return (_cachedPolls = polls);
}

export async function getPoll(pollHash: string): Promise<Poll> {
  const polls = await getPolls();
  const poll = polls.find(poll => poll.multiHash === pollHash);
  invariant(poll, `poll not found for poll hash ${pollHash}`);
  const content = await markdownToHtml(poll.content);

  return {
    ...poll,
    content
  };
}

export async function getPostsAndPhotos(): Promise<BlogPost[]> {
  const posts = await fetch(GOV_BLOG_POSTS_ENDPOINT).then(res => res.json());
  const photoLinks: string[] = await Promise.all(
    posts.map(post => fetch(post._links['wp:featuredmedia'][0].href).then(res => res.json()))
  ).then(photosMeta => (photosMeta as any).map(photoMeta => photoMeta.media_details.sizes.large.source_url));

  return posts.map((post, index) => ({
    title: post.title.rendered,
    date: post.date,
    photoHref: photoLinks[index]
  }));
}
