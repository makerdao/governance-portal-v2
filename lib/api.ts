import uniqBy from 'lodash/uniqBy';
import matter from 'gray-matter';
import validUrl from 'valid-url';
import invariant from 'tiny-invariant';
import chunk from 'lodash/chunk';

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
  const topics = await (await fetch(CMS_ENDPOINTS[network].allTopics)).json();
  const spells = await (await fetch(CMS_ENDPOINTS[network].allSpells)).json();
  let proposals: Array<any> = topics
    .filter(topic => topic.active)
    .filter(topic => !topic.govVote)
    .map(topic => topic.proposals)
    .flat();

  spells.forEach(spell => {
    spell.address = spell.source;
    delete spell.source;
  });

  proposals.forEach(proposal => {
    proposal.proposalBlurb = proposal.proposal_blurb;
    proposal.address = proposal.source;
    proposal.active = true;
    delete proposal.proposal_blurb;
    delete proposal.source;
  });

  const oldSpells = spells
    .filter(
      spell => proposals.findIndex(proposal => proposal.address === spell.address) === -1 // filter out active spells
    )
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  oldSpells.forEach(spell => {
    spell.active = false;
    spell.proposalBlurb = spell.proposal_blurb;
    spell.key = spell._id;
    delete spell.proposal_blurb;
    delete spell._id;
  });

  proposals.push(...oldSpells);
  proposals = proposals.slice(0, 100);
  return (_cachedProposals = proposals);
}

export async function getExecutiveProposal(proposalId: string): Promise<CMSProposal | null> {
  const proposals = await getExecutiveProposals();
  const proposal = proposals.find(proposal => proposal.key === proposalId);
  if (!proposal) return null;
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

  if (process.env.USE_FS_CACHE) {
    const cachedPolls = fsCacheGet('polls');
    if (cachedPolls) return JSON.parse(cachedPolls);
  } else if (process.env.NEXT_PUBLIC_USE_MOCK || isTestnet()) {
    return require('../mocks/polls.json');
  }

  const pollList = await maker.service('govPolling').getAllWhitelistedPolls();
  const polls = await parsePollsMetadata(pollList);

  if (process.env.USE_FS_CACHE) fsCacheSet('polls', JSON.stringify(polls));
  return (_cachedPolls = polls);
}

const fsCacheGet = name => {
  const fs = require('fs'); // eslint-disable-line @typescript-eslint/no-var-requires
  const path = `/tmp/gov-portal-${getNetwork()}-${name}-${new Date().toISOString().substring(0, 10)}`;
  if (fs.existsSync(path)) return fs.readFileSync(path).toString();
};

const fsCacheSet = (name, data) => {
  const fs = require('fs'); // eslint-disable-line @typescript-eslint/no-var-requires
  const path = `/tmp/gov-portal-${getNetwork()}-${name}-${new Date().toISOString().substring(0, 10)}`;
  fs.writeFileSync(path, data, err => console.error(err));
};

export async function parsePollsMetadata(pollList): Promise<Poll[]> {
  let numFailedFetches = 0;
  const failedPollIds: number[] = [];
  const polls: Poll[] = [];

  for (const pollGroup of chunk(
    uniqBy(pollList, p => p.multiHash),
    20
  )) {
    // fetch polls in batches, don't fetch a new batch until the current one has resolved
    const pollGroupWithData = await Promise.all(
      pollGroup.map(async p => {
        let document = '';
        try {
          document = await timeoutPromise(
            5000, // reject if it takes longer than this to fetch
            backoffRetry(3, () => fetch(p.url))
          ).then(resp => resp?.text());
          if (!(document.length > 0 && Object.keys(matter(document).data?.options)?.length > 0))
            throw new Error();
        } catch (err) {
          numFailedFetches += 1;
          failedPollIds.push(p.pollId);
          return null;
        }

        const pollMeta = matter(document).data;
        const content = matter(document).content || '';
        const summary = pollMeta?.summary || '';
        const title = pollMeta?.title || '';
        const options = pollMeta.options;
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
    );

    polls.push(...pollGroupWithData);
  }

  console.log(
    `---
  Failed to fetch docs for ${numFailedFetches}/${pollList.length} polls.
  IDs: ${failedPollIds}`
  );

  return (
    polls
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
  // these are not just mocks anymore, but the actual blog posts that should be shown in production
  return require('../mocks/blogPosts.json');

  // to add a new post to the json file:
  //
  // 1. use the search API endpoint to quickly find a post, e.g.:
  // https://blog.makerdao.com/wp-json/wp/v2/search?search=complete+decentralization
  //
  // 2. open ._links.self[0].href in the search result, e.g.:
  // https://blog.makerdao.com/wp-json/wp/v2/posts/6268
  //
  // 3. see the commented-out code below for how to create the BlogPost object

  // const posts = await fetch(GOV_BLOG_POSTS_ENDPOINT).then(res => res.json());
  // const photoLinks: string[] = await Promise.all(
  //   posts.map(post => fetch(post._links['wp:featuredmedia'][0].href).then(res => res.json()))
  // ).then(photosMeta => (photosMeta as any).map(photoMeta => photoMeta.media_details.sizes.medium_large.source_url));

  // return posts.map((post, index) => ({
  //   link: post.link,
  //   title: post.title.rendered,
  //   date: post.date,
  //   photoHref: photoLinks[index]
  // }));
}
