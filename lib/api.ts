import uniqBy from 'lodash/uniqBy';
import matter from 'gray-matter';
import invariant from 'tiny-invariant';
import chunk from 'lodash/chunk';

import { markdownToHtml, timeoutPromise, backoffRetry } from './utils';
import { EXEC_PROPOSAL_INDEX, EXEC_PROPOSAL_REPO } from './constants';
import getMaker, { getNetwork, isTestnet } from './maker';
import { slugify } from '../lib/utils';
import Poll, { PartialPoll } from '../types/poll';
import { CMSProposal } from '../types/proposal';
import BlogPost from '../types/blogPost';
import { parsePollMetadata } from './polling/parser';

export async function getExecutiveProposals(): Promise<Partial<CMSProposal>[]> {
  const network = getNetwork();

  const proposalIndex = await (await fetch(EXEC_PROPOSAL_INDEX)).json();

  const githubResponse = await (await fetch(EXEC_PROPOSAL_REPO)).json();
  const proposalUrls = githubResponse.filter(x => x.type === 'file').map(x => x.download_url);

  let proposals: Partial<CMSProposal>[] = [];
  for (const proposalLink of proposalUrls) {
    const proposalDoc = await (await fetch(proposalLink)).text();
    const {
      content,
      data: { title, summary, address, date }
    } = matter(proposalDoc);

    invariant(content && title && summary && address && date, 'Invalid proposal document');

    proposals.push({
      about: content,
      title,
      proposalBlurb: summary,
      key: slugify(title),
      address: address,
      date: String(date),
      active: proposalIndex[network].includes(proposalLink)
    });
  }

  proposals = proposals.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  proposals = proposals.slice(0, 100);
  if (process.env.USE_FS_CACHE) fsCacheSet('proposals', JSON.stringify(proposals));
  return proposals;
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

export async function getPolls(): Promise<Poll[]> {
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
  return polls;
}

const fsCacheCache = {};

const fsCacheGet = name => {
  const fs = require('fs'); // eslint-disable-line @typescript-eslint/no-var-requires
  const path = `/tmp/gov-portal-${getNetwork()}-${name}-${new Date().toISOString().substring(0, 10)}`;
  if (fsCacheCache[path]) {
    console.log(`mem cache hit: ${path}`);
    return fsCacheCache[path];
  }
  if (fs.existsSync(path)) {
    console.log(`fs cache hit: ${path}`);
    return fs.readFileSync(path).toString();
  }
};

const fsCacheSet = (name, data) => {
  const fs = require('fs'); // eslint-disable-line @typescript-eslint/no-var-requires
  const path = `/tmp/gov-portal-${getNetwork()}-${name}-${new Date().toISOString().substring(0, 10)}`;
  fs.writeFileSync(path, data, err => console.error(err));
  fsCacheCache[path] = data;
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
      pollGroup.map(async (p: PartialPoll) => {
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

        return parsePollMetadata(p, document);
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
