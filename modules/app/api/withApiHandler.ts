import type { NextApiHandler, NextApiRequest, NextApiResponse } from 'next';
import { withSentry } from '@sentry/nextjs';
import logger from 'lib/logger';

export default function withApiHandler(handler: NextApiHandler, { allowPost = false } = {}): NextApiHandler {
  return withSentry(async (req: NextApiRequest, res: NextApiResponse) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', allowPost ? 'GET, POST' : 'GET');
    res.setHeader('Access-Control-Allow-Headers', 'Authorization, Accept, Content-Type');

    if (req.method === 'OPTIONS') {
      return res.status(200).json({});
    }

    if (req.method !== 'GET' && (!allowPost || req.method !== 'POST')) {
      return res.status(405).json({
        error: {
          code: 'method_not_allowed',
          message: 'Only GET requests are supported for this endpoint.'
        }
      });
    }

    try {
      const result = await handler(req, res);
      return result;
    } catch (error) {
      logger.error(`API: ${req.method} ${req.url}`, error.message);
      return res.status(500).json({
        error: {
          code: 'unexpected_error',
          message: 'An unexpected error occurred.'
        }
      });
    }
  });
}
