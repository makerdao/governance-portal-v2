import type { NextApiHandler, NextApiRequest, NextApiResponse } from 'next';
import { withSentry } from '@sentry/nextjs';
import logger from 'lib/logger';
import { API_ERROR_CODES } from '../constants/apiErrors';
import { getMessageFromCode, ERROR_CODES } from 'eth-rpc-errors';

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
          code: API_ERROR_CODES.METHOD_NOT_ALLOWED,
          message: 'Only GET requests are supported for this endpoint.'
        }
      });
    }

    try {
      const result = await handler(req, res);
      return result;
    } catch (error) {
      const rpcMessage =
        'code' in error &&
        [...Object.values(ERROR_CODES.provider), ...Object.values(ERROR_CODES.rpc)].includes(error['code'])
          ? getMessageFromCode(error['code'])
          : null;

      logger.error(
        `API: ${req.method} ${req.url} `,
        error.message,
        `${rpcMessage ? `RPC Errpr: ${rpcMessage}` : ''}`
      );
      const status = error.status || 500;
      const code = error.code || API_ERROR_CODES.UNEXPECTED_ERROR;
      const message = error.clientMessage ? error.clientMessage : 'An unexpected error ocurred';

      return res.status(status).json({
        error: {
          code,
          message
        }
      });
    }
  });
}
