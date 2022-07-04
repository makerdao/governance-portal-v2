import { NextApiRequest, NextApiResponse } from 'next';
import withApiHandler from 'modules/app/api/withApiHandler';
import { config } from 'lib/config';

async function postRequestToDiscord({ oldAddress, newAddress }: MigrationRequestBody) {
  const resp = await fetch(config.MIGRATION_WEBHOOK_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      content: `
      New migration request received. Previous addresss: ${oldAddress}. New address: ${newAddress}
      `
    })
  });

  return resp.json();
}

type MigrationRequestBody = {
  oldAddress: string;
  newAddress: string;
};

export default withApiHandler(
  async (req: NextApiRequest, res: NextApiResponse) => {
    const body = JSON.parse(req.body) as MigrationRequestBody;

    if (!body.newAddress || !body.oldAddress) {
      return res.status(400).json({ error: 'request missing parameters' });
    }

    const data = postRequestToDiscord({ oldAddress: body.oldAddress, newAddress: body.newAddress });
    res.setHeader('Cache-Control', 's-maxage=30, stale-while-revalidate');
    res.status(200).json({ data });
  },
  { allowPost: true }
);
