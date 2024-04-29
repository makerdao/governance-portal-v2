import { writeFile } from 'fs/promises';

const forkVnet = async (displayName: string) => {
  if (!displayName.length) {
    throw new Error('A display name is required for the virtual testnet');
  }
  const res = await fetch(
    'https://api.tenderly.co/api/v1/account/jetstreamgg/project/jetstream/testnet/clone',
    {
      headers: [
        ['accept', 'application/json, text/plain, */*'],
        ['content-type', 'application/json'],
        ['X-Access-Key', `${process.env.TENDERLY_API_KEY}`]
      ],
      method: 'POST',
      body: JSON.stringify({
        srcContainerId: '5fdf1b3b-b584-4612-a04c-54f9fb3392df',
        dstContainerDisplayName: displayName
      })
    }
  );

  const testnetData = await res.json();

  if (res.status !== 200) {
    console.error('There was an error while forking the virtual testnet:', testnetData);
    process.exit(1);
  }

  console.log('Virtual Testnet successfully forked');

  await writeFile(
    './tenderlyTestnetData.json',
    JSON.stringify({
      TENDERLY_TESTNET_ID: testnetData.id,
      TENDERLY_RPC_URL: testnetData.connectivityConfig.endpoints[0].uri
    })
  );
};

const displayName = process.argv[2];
forkVnet(displayName);
