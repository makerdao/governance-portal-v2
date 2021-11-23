import { NextApiRequest, NextApiResponse } from 'next';
import withApiHandler from 'lib/api/withApiHandler';
import { DEFAULT_NETWORK, SupportedNetworks } from 'lib/constants';
import { getPollTally } from 'modules/polling/helpers/getPollTaly';
import { getPollById } from 'modules/polling/api/fetchPolls';

// Returns a PollTally given a pollID
export default withApiHandler(async (req: NextApiRequest, res: NextApiResponse) => {
  const network = (req.query.network as SupportedNetworks) || DEFAULT_NETWORK;

  const poll = await getPollById(parseInt(req.query['poll-id'] as string, 10), network);
  const tally = await getPollTally(poll, network);

  res.setHeader('Cache-Control', 's-maxage=15, stale-while-revalidate');
  res.status(200).json(tally);
});
