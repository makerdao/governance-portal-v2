import uniqBy from 'lodash.uniqby';
import matter from 'gray-matter';

import _maker from './maker';

export default async function() {
  const maker = await _maker;
  const pollsList = await maker.service('govPolling').getAllWhitelistedPolls();

  return (
    await Promise.all(
      uniqBy(pollsList, p => p.multiHash).map(async p => {
        const document = p.url ? await (await fetch(p.url)).text() : null;
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
  ).filter(p => !!p.summary && !!p.options);
}
