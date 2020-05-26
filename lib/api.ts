import uniqBy from 'lodash.uniqby';
import matter from 'gray-matter';
import validUrl from 'valid-url';

import { markdownToHtml, timeoutPromise, backoffRetry } from './utils';
import { CMS_ENDPOINTS, GOV_BLOG_POSTS_ENDPOINT } from './constants';
import getMaker, { getNetwork } from './maker';
import Poll from '../types/poll';
import Proposal from '../types/proposal';
import BlogPost from '../types/blogPost';

let _cachedProposals;
export async function getExecutiveProposals({ useCache = false } = {}): Promise<
  Proposal[]
> {
  if (useCache && _cachedProposals) return _cachedProposals;
  const network = getNetwork();
  if (typeof CMS_ENDPOINTS[network] === 'undefined') return [];
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
): Promise<Proposal> {
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
export async function getPolls({ useCache = false } = {}): Promise<Poll[]> {
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
            backoffRetry(3, () => fetch(p.url))
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
    (polls as any[])
      .filter(p => !!p.summary && !!p.options)
      // newest to oldest
      .sort(
        (a, b) =>
          new Date(b.startDate).getTime() - new Date(a.startDate).getTime()
      )
  );

  _cachedPolls = polls;
  return polls;
}

export async function getPoll(
  pollHash,
  { useCache = false } = {}
): Promise<Poll> {
  const polls = useCache && _cachedPolls ? _cachedPolls : await getPolls();
  const [poll] = polls.filter(p => p.multiHash === pollHash);
  const content = await markdownToHtml(poll?.content || '');

  return {
    ...poll,
    content
  };
}

export async function getPostsAndPhotos(): Promise<BlogPost[]> {
  const posts = await fetch(GOV_BLOG_POSTS_ENDPOINT).then(res => res.json());
  const photoLinks: string[] = await Promise.all(
    posts.map(post =>
      fetch(post._links['wp:featuredmedia'][0].href).then(res => res.json())
    )
  ).then(photosMeta =>
    (photosMeta as any).map(
      photoMeta => photoMeta.media_details.sizes.large.source_url
    )
  );

  return posts.map((post, index) => ({
    title: post.title.rendered,
    date: post.date,
    photoHref: photoLinks[index]
  }));
}
