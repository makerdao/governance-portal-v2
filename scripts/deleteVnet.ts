import { readFile } from 'fs/promises';

const deleteVnet = async () => {
  const file = await readFile('./tenderlyTestnetData.json', 'utf-8');
  const { TENDERLY_TESTNET_ID } = JSON.parse(file);

  const res = await fetch(
    `https://api.tenderly.co/api/v1/account/jetstreamgg/project/jetstream/testnet/container/${TENDERLY_TESTNET_ID}`,
    {
      headers: [['X-Access-Key', `${process.env.TENDERLY_API_KEY}`]],
      method: 'DELETE'
    }
  );

  if (res.status === 204) {
    console.log('Virtual Testnet successfully deleted');
  } else {
    console.log('There was an error while deleting the virtual testnet');
  }
};

deleteVnet();
