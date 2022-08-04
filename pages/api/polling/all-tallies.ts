import invariant from 'tiny-invariant';
import { NextApiRequest, NextApiResponse } from 'next';
import { getPolls } from 'modules/polling/api/fetchPolls';
import withApiHandler from 'modules/app/api/withApiHandler';
import { DEFAULT_NETWORK } from 'modules/web3/constants/networks';
import { isSupportedNetwork } from 'modules/web3/helpers/networks';
import { getPollTally } from 'modules/polling/helpers/getPollTally';

export default withApiHandler(async (req: NextApiRequest, res: NextApiResponse) => {
  const network = (req.query.network as string) || DEFAULT_NETWORK.network;
  invariant(isSupportedNetwork(network), `unsupported network ${network}`);

  const filters = {
    startDate: req.query.startDate ? new Date(req.query.startDate as string) : null,
    endDate: req.query.endDate ? new Date(req.query.endDate as string) : null,
    tags: req.query.tags ? (typeof req.query.tags === 'string' ? [req.query.tags] : req.query.tags) : null
  };

  const pollsResponse = await getPolls(filters, network);

  const tallies = await Promise.all(pollsResponse.polls.map(async ( poll) => {
    try{
        const tally = await getPollTally(poll, network);
    return {
        ...tally, 
        pollId: poll.pollId
    }
    }catch(e) {
        return {
            pollId: poll.pollId
        }
    }
  }))

  res.setHeader('Cache-Control', 's-maxage=15, stale-while-revalidate');
  res.status(200).json(tallies);
});
