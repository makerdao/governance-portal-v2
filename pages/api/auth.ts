import { NextApiRequest, NextApiResponse } from 'next';
import withApiHandler from 'modules/app/api/withApiHandler';
import logger from 'lib/logger';
import { config } from 'lib/config';

export default withApiHandler(
  async (req: NextApiRequest, res: NextApiResponse) => {
    try {
      const { password } = req.body;
      if (!config.DASHBOARD_PASSWORD) {
        return res.status(200).json({
          auth: 'ok'
        });
      }
      if (password === config.DASHBOARD_PASSWORD) {
        // password is valid

        return res.status(200).json({
          auth: 'ok'
        });
      }

      return res.status(401).json({
        auth: 'Not ok'
      });
    } catch (e) {
      logger.error(`auth: ${e.message}`);
      return res.status(401).json({
        auth: 'Not ok'
      });
    }
  },
  {
    allowPost: true
  }
);
