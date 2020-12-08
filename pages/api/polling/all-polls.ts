import invariant from 'tiny-invariant';
import { NextApiRequest, NextApiResponse } from 'next';

import { parsePollsMetadata } from '../../../lib/api';
import { getConnectedMakerObj } from '../_lib/utils';
import { isSupportedNetwork } from '../../../lib/maker';
import { DEFAULT_NETWORK } from '../../../lib/constants';
import withApiHandler from '../_lib/withApiHandler';

const cachingFetch = async url => {
  if (!process.env.USE_CACHING_FETCH) return fetch(url).then(resp => resp?.text());

  const fs = require('fs');
  const filenamify = require('filenamify');
  const basename = filenamify(url.split('/').slice(7).join('--'));
  const path = `/tmp/gov-portal--${basename}`;
  if (fs.existsSync(path)) {
    console.log(`hit: ${path}`);
    return fs.readFileSync(path).toString();
  }

  console.log(`miss: ${path}`);
  const data = await fetch(url).then(resp => resp?.text());
  if (data) fs.writeFileSync(path, data, err => console.error(err));
  return data;
};

export default withApiHandler(async (req: NextApiRequest, res: NextApiResponse) => {
  const network = (req.query.network as string) || DEFAULT_NETWORK;
  invariant(isSupportedNetwork(network), `unsupported network ${network}`);

  const maker = await getConnectedMakerObj(network);
  const pollList = await maker.service('govPolling').getAllWhitelistedPolls();
  const polls = await parsePollsMetadata(pollList, cachingFetch);

  res.setHeader('Cache-Control', 's-maxage=15, stale-while-revalidate');
  res.status(200).json(polls);
});
