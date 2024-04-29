/**
 * Fork a new tenderly testnet at the start of each test file and delete it at the end of the file.
 * This file has to be imported in every e2e test file that you want it to run on.
 */
import { test } from '@playwright/test';
import { writeFile, readFile } from 'fs/promises';
import dotenv from 'dotenv';

dotenv.config();

const displayName = process.env.CI ? 'ci-tests-testnet' : 'local-tests-testnet';
test.beforeAll(async () => {
  await forkVnet(displayName);
});

test.afterAll(async () => {
  await deleteVnet();
});

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
