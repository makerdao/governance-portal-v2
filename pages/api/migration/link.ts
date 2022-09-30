import { NextApiRequest, NextApiResponse } from 'next';
import withApiHandler from 'modules/app/api/withApiHandler';
import { config } from 'lib/config';
import { postRequestToDiscord } from 'modules/app/api/postRequestToDiscord';
import { ApiError } from 'modules/app/api/ApiError';

export default withApiHandler(
  async (req: NextApiRequest, res: NextApiResponse) => {
    if (!config.MIGRATION_WEBHOOK_URL) {
      throw new ApiError('Migration discord webhook not properly configured', 500);
    }

    const body = JSON.parse(req.body);

    if (!body.sig || !body.msg) {
      throw new ApiError('Migration discord: Missing parameters', 400, 'Invalid request parameters');
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
      throw new ApiError(`Migration Webhook ${err.message}`, 500);
    }
  },
  { allowPost: true }
);
