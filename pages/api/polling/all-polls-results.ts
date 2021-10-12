import invariant from 'tiny-invariant';
import { NextApiRequest, NextApiResponse } from 'next';
import { isSupportedNetwork } from 'lib/maker';
import { DEFAULT_NETWORK } from 'lib/constants';
import withApiHandler from 'lib/api/withApiHandler';
import getMaker from 'lib/maker';
import chunk from 'lodash/chunk';
import { fetchPollTally } from 'modules/polling/api/fetchPollTally';
import { parseRawPollTally } from 'modules/polling/helpers/parseRawTally';
import { parsePollsMetadata } from 'modules/polling/api/parsePollMetadata';

type WinningResult = {
  pollId: string;
  winningOption: string;
};

export default withApiHandler(async (req: NextApiRequest, res: NextApiResponse) => {
  const network = (req.query.network as string) || DEFAULT_NETWORK;
  invariant(isSupportedNetwork(network), `unsupported network ${network}`);
  const maker = await getMaker(network);

  const pollList = await maker.service('govPolling').getAllWhitelistedPolls();
  const polls = await parsePollsMetadata(pollList);

  const allResults: WinningResult[] = [];

  for (const pollGroup of chunk(polls, 20)) {
    const results: WinningResult[] = await Promise.all(
      pollGroup.map(async poll => {
        const useCache = false;
        const tally = await fetchPollTally(poll.pollId, poll.voteType, useCache, network);
        const parsedTally = parseRawPollTally(tally, poll);

        return {
          pollId: poll.pollId,
          winningOption: parsedTally.winningOptionName
        };
      })
    );

    allResults.push(...results);
  }

  res.setHeader('Cache-Control', 's-maxage=15, stale-while-revalidate');
  res.status(200).json(allResults);
});
