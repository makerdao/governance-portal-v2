import { NextApiRequest, NextApiResponse } from 'next';
import withApiHandler from 'modules/app/api/withApiHandler';
import { config } from 'lib/config';
import { ApiError } from 'modules/app/api/ApiError';

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

      throw new ApiError('Unauthorized', 401, 'Unauthorized');
    } catch (e) {
      throw new ApiError(`auth: ${e.message}`, 401, 'Unauthorized');
    }
  },
  {
    allowPost: true
  }
);
