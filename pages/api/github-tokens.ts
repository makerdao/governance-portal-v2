import { NextApiRequest, NextApiResponse } from 'next';
import withApiHandler from 'modules/app/api/withApiHandler';
import { config } from 'lib/config';

async function getRateLimit(token) {
  const resp = await fetch('https://api.github.com/rate_limit', {
    headers: {
      Authorization: `token ${token}`
    }
  });
  const info = await resp.json();
  return info.rate;
}

export default withApiHandler(async (req: NextApiRequest, res: NextApiResponse) => {
  const data = config.GITHUB_TOKEN ? await getRateLimit(config.GITHUB_TOKEN) : '';
  const data2 = config.GITHUB_TOKEN_2 ? await getRateLimit(config.GITHUB_TOKEN_2) : '';
  const data3 = config.GITHUB_TOKEN_3 ? await getRateLimit(config.GITHUB_TOKEN_3) : '';
  res.setHeader('Cache-Control', 's-maxage=30, stale-while-revalidate');
  res.status(200).json({ 1: data, 2: data2, 3: data3 });
});
