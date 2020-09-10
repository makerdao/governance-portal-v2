import uniqBy from 'lodash/uniqBy';
import matter from 'gray-matter';
import validUrl from 'valid-url';
import invariant from 'tiny-invariant';

import { markdownToHtml, timeoutPromise, backoffRetry } from './utils';
import { CMS_ENDPOINTS, GOV_BLOG_POSTS_ENDPOINT } from './constants';
import getMaker, { getNetwork, isTestnet } from './maker';
import Poll from '../types/poll';
import { CMSProposal } from '../types/proposal';
import BlogPost from '../types/blogPost';
import VoteTypes from '../types/voteTypes';

let _cachedProposals: CMSProposal[];
/**
 * The first time this method is called, it fetches fresh proposals and caches them.
 * Everytime after that, it returns from the cache.
 */
export async function getExecutiveProposals(): Promise<CMSProposal[]> {
  if (process.env.NEXT_PUBLIC_USE_MOCK || isTestnet()) return require('../mocks/proposals.json');
  const network = getNetwork();
  invariant(network in CMS_ENDPOINTS, `no cms endpoint known for network ${network}`);
  if (_cachedProposals) return _cachedProposals;
  const topics = await (await fetch(CMS_ENDPOINTS[network])).json();
  const proposals = topics
    .filter(proposal => proposal.active)
    .filter(proposal => !proposal.govVote)
    .map(topic => topic.proposals)
    .flat();

  proposals.forEach(proposal => {
    proposal.proposalBlurb = proposal.proposal_blurb;
    proposal.address = proposal.source;
    delete proposal.proposal_blurb;
    delete proposal.source;
  });

  return (_cachedProposals = proposals);
}

export async function getExecutiveProposal(proposalId: string): Promise<CMSProposal> {
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
  if (process.env.NEXT_PUBLIC_USE_MOCK || isTestnet()) return require('../mocks/polls.json');
  if (_cachedPolls) return _cachedPolls;

  const maker = await getMaker();
  const pollList = await maker.service('govPolling').getAllWhitelistedPolls();
  const polls = await parsePollsMetadata(pollList);

  return (_cachedPolls = polls);
}

export function parsePollsMetadata(pollList): Promise<Poll[]> {
  return Promise.all(
    uniqBy(pollList, p => p.multiHash).map(async p => {
      let document = '';
      try {
        document = await timeoutPromise(
          5000, // reject if it takes longer than this to fetch
          backoffRetry(3, () => fetch(p.url))
        ).then(response => response?.text());
        if (!(document.length > 0 && Object.keys(matter(document).data?.options)?.length > 0))
          throw new Error();
      } catch (err) {
        console.log(`unable to fetch valid poll document from ${p.url} for poll ${p.pollId}`);
        return null;
      }

      const pollMeta = matter(document).data;
      const content = matter(document).content || '';
      const summary = pollMeta?.summary || '';
      const title = pollMeta?.title || '';
      const options = pollMeta.options;
      delete options[0]; // delete abstain option
      const discussionLink =
        pollMeta?.discussion_link && validUrl.isUri(pollMeta.discussion_link)
          ? pollMeta.discussion_link
          : null;
      const voteType: VoteTypes =
        (pollMeta as { vote_type: VoteTypes | null })?.vote_type || 'Plurality Voting'; // compiler error if invalid vote type
      const category = pollMeta?.category || 'Uncategorized';
      return {
        ...p,
        slug: p.multiHash.slice(0, 8),
        startDate: `${p.startDate}`,
        endDate: `${p.endDate}`,
        content,
        summary,
        title,
        options,
        discussionLink,
        voteType,
        category
      };
    })
  ).then(polls =>
    (polls as any[])
      .filter(p => !!p && !!p.summary && !!p.options)
      .filter(poll => new Date(poll.startDate).getTime() <= Date.now())
      // newest to oldest
      .sort((a, b) => new Date(b.startDate).getTime() - new Date(a.startDate).getTime())
  );
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

export async function getPostsAndPhotos(): Promise<BlogPost[]> {
  if (process.env.NEXT_PUBLIC_USE_MOCK) return require('../mocks/blogPosts.json');
  const posts = await fetch(GOV_BLOG_POSTS_ENDPOINT).then(res => res.json());
  const photoLinks: string[] = await Promise.all(
    posts.map(post => fetch(post._links['wp:featuredmedia'][0].href).then(res => res.json()))
  ).then(photosMeta => (photosMeta as any).map(photoMeta => photoMeta.media_details.sizes.large.source_url));

  return posts.map((post, index) => ({
    link: post.link,
    title: post.title.rendered,
    date: post.date,
    photoHref: photoLinks[index]
  }));
}
