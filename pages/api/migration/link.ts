import { NextApiRequest, NextApiResponse } from 'next';
import withApiHandler from 'modules/app/api/withApiHandler';
import { config } from 'lib/config';

async function postRequestToDiscord(content: string) {
  const resp = await fetch(config.MIGRATION_WEBHOOK_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ content })
  });

  return resp;
}

export default withApiHandler(
  async (req: NextApiRequest, res: NextApiResponse) => {
    if (!config.MIGRATION_WEBHOOK_URL) {
      return res.status(500).json({ error: 'Discord webhook not properly configured' });
    }

    const body = JSON.parse(req.body);

    if (!body.sig || !body.msg) {
      return res.status(400).json({ error: 'Request missing parameters' });
    }

    const data = postRequestToDiscord(JSON.stringify(body));
    res.setHeader('Cache-Control', 's-maxage=30, stale-while-revalidate');
    res.status(200).json({ data });
  },
  { allowPost: true }
);
