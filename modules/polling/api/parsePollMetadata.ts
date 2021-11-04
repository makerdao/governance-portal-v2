import { PartialPoll, Poll } from 'modules/polling/types';
import uniqBy from 'lodash/uniqBy';
import chunk from 'lodash/chunk';
import { backoffRetry, timeoutPromise } from 'lib/utils';
import matter from 'gray-matter';
import { parsePollMetadata } from '../helpers/parser';

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
      // closest to expiration shown first
      .sort((a, b) =>
        Date.now() - new Date(a.endDate).getTime() < Date.now() - new Date(b.endDate).getTime() ? -1 : 1
      )
  );
}
