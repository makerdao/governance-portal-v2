import { NextApiRequest, NextApiResponse } from 'next';
import zipObject from 'lodash/zipObject';

import withApiHandler from 'lib/api/withApiHandler';
import { analyzeSpell } from './[address]';
import { getConnectedMakerObj } from 'lib/api/utils';
import { DEFAULT_NETWORK } from 'lib/constants';
import invariant from 'tiny-invariant';
import { isSupportedNetwork } from 'lib/maker';

export default withApiHandler(
  async (req: NextApiRequest, res: NextApiResponse) => {
    const { addresses } = JSON.parse(req.body);

    const network = (req.query.network as string) || DEFAULT_NETWORK;
    invariant(isSupportedNetwork(network), `unsupported network ${network}`);

    const maker = await getConnectedMakerObj(network);

    let sampleError,
      failures = 0;

    // FIXME most of the spells here will be unchanged most of the time;
    // we should waste less effort re-fetching the same data

    const spellData = (
      await Promise.all(
        addresses.map(async address => {
          try {
            // a rare valid use of `return await`
            return await analyzeSpell(address, maker);
          } catch (err) {
            failures++;
            if (!sampleError) sampleError = err;
          }
        })
      )
    ).filter(x => x);
    if (failures > 0) {
      console.error(
        `Failed to fetch data for ${failures}/${addresses.length} spell(s). Sample error: ${sampleError}`
      );
    }
    res.setHeader('Cache-Control', 'maxage=30, stale-while-revalidate');
    res.status(200).json(zipObject(addresses, spellData));
  },
  { allowPost: true }
);
