import { NextApiRequest, NextApiResponse } from 'next';
import withApiHandler from 'modules/app/api/withApiHandler';
import { config } from 'lib/config';
import { postRequestToDiscord } from 'modules/app/api/postRequestToDiscord';

export default withApiHandler(
  async (req: NextApiRequest, res: NextApiResponse) => {
    if (!config.MIGRATION_WEBHOOK_URL) {
      return res.status(500).json({ error: 'Discord webhook not properly configured' });
    }

    const body = JSON.parse(req.body);

    if (!body.sig || !body.msg) {
      return res.status(400).json({ error: 'Request missing parameters' });
    }

    try {
      const data = await postRequestToDiscord({
        url: config.MIGRATION_WEBHOOK_URL,
        content: JSON.stringify(body),
        notify: true
      });
      res.setHeader('Cache-Control', 's-maxage=30, stale-while-revalidate');
      res.status(200).json({ data });
    } catch (err) {
      return res.status(500).json({ error: 'Internal server error' });
    }
  },
  { allowPost: true }
);
