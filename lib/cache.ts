import fs from 'fs';
import os from 'os';
import { DEFAULT_NETWORK, SupportedNetworks } from 'modules/web3/constants/networks';
import { config } from 'lib/config';
import Redis from 'ioredis';

const redis = config.REDIS_URL
  ? new Redis(config.REDIS_URL, {
      connectTimeout: 10000
    })
  : null;

const oneHourInMS = 60 * 60 * 1000;

// Mem cache does not work on local instances of nextjs because nextjs creates clean memory states each time.
const memoryCache = {};

function getFilePath(name: string, network: string): string {
  const date = new Date().toISOString().substring(0, 10);

  return `${os.tmpdir()}/gov-portal-${network}-${name}-${date}`;
}

export const cacheDel = (path: string): void => {
  console.log('Delete cache', path);
  fs.unlinkSync(path);
  memoryCache[path] = null;
};

export const cacheGet = async (
  name: string,
  network?: SupportedNetworks,
  expiryMs?: number
): Promise<any> => {
  const isRedisCache = !!config.REDIS_URL;

  try {
    const currentNetwork = network || DEFAULT_NETWORK.network;
    const path = getFilePath(name, currentNetwork);

    if (isRedisCache && redis) {
      // Get redis data if it exists
      const cachedData = await redis.get(path);
      return cachedData;
    } else {
      // If fs does not exist as a module, return null (TODO: This shouldn't happen, consider removing this check)
      if (Object.keys(fs).length === 0) return null;
      const memCached = memoryCache[path];

      if (memCached) {
        console.log(`mem cache hit: ${path}`);

        if (memCached.expiry && memCached.expiry < Date.now()) {
          console.log('mem cache expired');
          cacheDel(path);
          return null;
        }

        return memoryCache[path].data;
      }

      if (fs.existsSync(path)) {
        // In nextjs serverless instances of API functions sometimes reset their in memory cache (they are different instances)
        // In order to have an expiry date we can also check the last time this file was accessed or it was created. This conditions having to pass the expiryMs on the cacheGet too
        const { birthtime } = fs.statSync(path);

        if (expiryMs && birthtime && birthtime.getTime() < Date.now() + expiryMs) {
          cacheDel(path);
          return null;
        }

        console.log(`fs cache hit: ${path}`);
        return fs.readFileSync(path).toString();
      }
    }
  } catch (e) {
    console.error(`Error getting cached data, ${name} - ${network}`, e.message);
    return null;
  }
};

export const cacheSet = (
  name: string,
  data: string,
  network?: SupportedNetworks,
  expiryMs = oneHourInMS
): void => {
  const isRedisCache = !!config.REDIS_URL;
  const currentNetwork = network || DEFAULT_NETWORK.network;

  const path = getFilePath(name, currentNetwork);

  try {
    if (isRedisCache && redis) {
      // If redis cache is enabled, store in redis, with a TTL in seconds

      redis.set(path, data, 'EX', expiryMs / 1000);
    } else {
      // File cache
      if (Object.keys(fs).length === 0) return;

      fs.writeFileSync(path, data);

      memoryCache[path] = {
        expiry: expiryMs ? Date.now() + expiryMs : null,
        data
      };
    }
  } catch (e) {
    console.error(`Error storing data in cache, ${name} - ${network}`, e.message);
  }
};
