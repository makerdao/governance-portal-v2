import { NextApiRequest, NextApiResponse } from 'next';
import invariant from 'tiny-invariant';
import BigNumber from 'bignumber.js';
import withApiHandler from 'lib/api/withApiHandler';
import { getConnectedMakerObj } from 'lib/api/utils';
import { isSupportedNetwork } from 'lib/maker';
import { DEFAULT_NETWORK } from 'lib/constants';
import { backoffRetry } from 'lib/utils';
import { PollTallyVote } from 'modules/polls/types';

function createPollTallyRoute({ cacheType }: { cacheType: string }) {
  return withApiHandler(async (req: NextApiRequest, res: NextApiResponse) => {
    const pollId = req.query['poll-id'] as string;
    const network = (req.query.network as string) || DEFAULT_NETWORK;

    invariant(pollId, 'poll id required');
    invariant(isSupportedNetwork(network), `unsupported network ${network}`);

    const maker = await getConnectedMakerObj(network);
    const tally = await backoffRetry(3, () => maker.service('govPolling').getTallyRankedChoiceIrv(pollId));

    // const votesByAddress: PollTallyVote[] = (
    //   await maker.service('govPolling').getMkrAmtVotedByAddress(pollId)
    // )
    //   // .map(vote => ({ ...vote, option: tally.options[vote.optionId] }))
    //   .sort((a, b) => (new BigNumber(a.mkrSupport).lt(new BigNumber(b.mkrSupport)) ? 1 : -1));

    // mock response
    const votesByAddress = [
      {
        voter: '0xad2fda5f6ce305d2ced380fdfa791b6a26e7f281',
        optionId: 1,
        optionIdRaw: '1',
        mkrSupport: '28128.348237700267527223',
        rankedChoiceOption: [1]
      },
      {
        voter: '0x00daec2c2a6a3fcc66b02e38b7e56dcdfa9347a1',
        optionId: 2,
        optionIdRaw: '2',
        mkrSupport: '25032.000000000000000000',
        rankedChoiceOption: [2]
      },
      {
        voter: '0xaf8aa6846539033eaf0c3ca4c9c7373e370e039b',
        optionId: 1,
        optionIdRaw: '1',
        mkrSupport: '5038.916592706405220986',
        rankedChoiceOption: [1]
      },
      {
        voter: '0x87e6888935180a9b27a9b48b75c9b779bfec1f76',
        optionId: 0,
        optionIdRaw: '0',
        mkrSupport: '1480.609359492058691716',
        rankedChoiceOption: []
      },
      {
        voter: '0xc54c3691419c2996eb6e76b421e7f1132ab0ee7a',
        optionId: 2,
        optionIdRaw: '2',
        mkrSupport: '1325.121561578451363619',
        rankedChoiceOption: [2]
      },
      {
        voter: '0x54e15ca35bbbcc3d75616de3d2c46ba80ac8cb28',
        optionId: 0,
        optionIdRaw: '0',
        mkrSupport: '600.294877698467344233',
        rankedChoiceOption: []
      },
      {
        voter: '0x14a4ed2000ca405452c140e21c10b3536c1a98e4',
        optionId: 1,
        optionIdRaw: '1',
        mkrSupport: '239.500000000000000000',
        rankedChoiceOption: [1]
      },
      {
        voter: '0x979d8a73ce29c3251747f52b192b2bfe13b9fd72',
        optionId: 2,
        optionIdRaw: '2',
        mkrSupport: '200.000204806431039674',
        rankedChoiceOption: [2]
      },
      {
        voter: '0x45127ec92b58c3a89e89f63553073adcaf2f1f5f',
        optionId: 0,
        optionIdRaw: '0',
        mkrSupport: '139.344564657398088097',
        rankedChoiceOption: []
      },
      {
        voter: '0xb21e535fb349e4ef0520318acfe589e174b0126b',
        optionId: 1,
        optionIdRaw: '1',
        mkrSupport: '33.000066666531976857',
        rankedChoiceOption: [1]
      },
      {
        voter: '0x3c8319dd83fa18ec1a0df2acf65277a731514d67',
        optionId: 1,
        optionIdRaw: '1',
        mkrSupport: '11.994464060000000000',
        rankedChoiceOption: [1]
      },
      {
        voter: '0x22d5294a23d49294bf11d9db8beda36e104ad9b3',
        optionId: 1,
        optionIdRaw: '1',
        mkrSupport: '8.700000000000000000',
        rankedChoiceOption: [1]
      },
      {
        voter: '0x429f3589dab474e72ca528a4d416bd7b95d2ae25',
        optionId: 1,
        optionIdRaw: '1',
        mkrSupport: '1.451364912195342707',
        rankedChoiceOption: [1]
      },
      {
        voter: '0xb4610639e76c7a1ece45c99df592c677c60a3a84',
        optionId: 1,
        optionIdRaw: '1',
        mkrSupport: '0.333272001052475317',
        rankedChoiceOption: [1]
      },
      {
        voter: '0xefcc3401739427eb0491cc27c7baa06817c7dfdb',
        optionId: 2,
        optionIdRaw: '2',
        mkrSupport: '0',
        rankedChoiceOption: [2]
      }
    ];

    const totalMkrParticipation = tally.totalMkrParticipation;
    const winner: string = tally.winner;
    const rounds = parseInt(tally.rounds);
    const numVoters = parseInt(tally.numVoters);

    const parsedTally = {
      options: tally.options,
      winner,
      rounds,
      totalMkrParticipation,
      numVoters,
      votesByAddress
    };

    res.setHeader('Cache-Control', cacheType);
    res.status(200).json(parsedTally);
  });
}

export { createPollTallyRoute };

export default createPollTallyRoute({
  cacheType: 's-maxage=5, stale-while-revalidate'
});
