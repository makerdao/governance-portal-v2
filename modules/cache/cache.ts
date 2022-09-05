import fs from 'fs';
import os from 'os';
import { DEFAULT_NETWORK, SupportedNetworks } from 'modules/web3/constants/networks';
import { config } from 'lib/config';
import Redis from 'ioredis';
import packageJSON from '../../package.json';
import logger from 'lib/logger';
import { ONE_HOUR_IN_MS } from 'modules/app/constants/time';

const redis = config.REDIS_URL
  ? new Redis(config.REDIS_URL, {
      connectTimeout: 10000
    })
  : null;

// Mem cache does not work on local instances of nextjs because nextjs creates clean memory states each time.
const memoryCache = {};

function getFilePath(name: string, network: string): string {
  const date = new Date().toISOString().substring(0, 10);

  return `${os.tmpdir()}/gov-portal-version-${packageJSON.version}-${network}-${name}-${date}`;
}

export const cacheDel = (name: string, network: SupportedNetworks): void => {
  const path = getFilePath(name, network);

  const isRedisCache = !!config.REDIS_URL;

  if (isRedisCache && redis) {
    logger.debug('cacheDel redis: ', path);
    redis?.del(path);
  } else {
    try {
      logger.debug('cacheDel: ', path);
      memoryCache[path] = null;
      fs.unlinkSync(path);
    } catch (e) {
      logger.error(`cacheDel: ${e.message}`);
    }
  }
};

export const getCacheInfo = async (name: string, network: SupportedNetworks): Promise<any> => {
  if (!config.USE_CACHE || config.USE_CACHE === 'false') {
    return Promise.resolve(null);
  }

  const isRedisCache = !!config.REDIS_URL;

  try {
    const currentNetwork = network || DEFAULT_NETWORK.network;
    const path = getFilePath(name, currentNetwork);
    console.log(path);
    if (isRedisCache && redis) {
      const ttl = await redis?.ttl(path);
      return ttl;
    }
  } catch (e) {
    logger.error(e);
  }
};

export const cacheGet = async (
  name: string,
  network?: SupportedNetworks,
  expiryMs?: number
): Promise<any> => {
  if (!config.USE_CACHE || config.USE_CACHE === 'false') {
    return Promise.resolve(null);
  }

  const isRedisCache = !!config.REDIS_URL;

  try {
    const currentNetwork = network || DEFAULT_NETWORK.network;
    const path = getFilePath(name, currentNetwork);

    if (isRedisCache && redis) {
      // Get redis data if it exists
      const cachedData = await redis.get(path);
      logger.debug(`Redis cache get for ${path}`);
      return cachedData;
    } else {
      // If fs does not exist as a module, return null (TODO: This shouldn't happen, consider removing this check)
      if (Object.keys(fs).length === 0) return null;
      const memCached = memoryCache[path];

      if (memCached) {
        logger.debug(`mem cache hit: ${path}`);

        if (memCached.expiry && memCached.expiry < Date.now()) {
          logger.debug('mem cache expired');
          cacheDel(name, currentNetwork);
          return null;
        }

        return memoryCache[path].data;
      }

      if (fs.existsSync(path)) {
        // In nextjs serverless instances of API functions sometimes reset their in memory cache (they are different instances)
        // In order to have an expiry date we can also check the last time this file was accessed or it was created. This conditions having to pass the expiryMs on the cacheGet too
        const { birthtime } = fs.statSync(path);

        if (expiryMs && birthtime && birthtime.getTime() < Date.now() + expiryMs) {
          cacheDel(name, currentNetwork);
          return null;
        }

        logger.debug(`fs cache hit: ${path}`);
        return fs.readFileSync(path).toString();
      }
    }
  } catch (e) {
    logger.error(`CacheGet: Error getting cached data, ${name} - ${network}`, e.message);
    return null;
  }
};

export const cacheSet = (
  name: string,
  data: string,
  network?: SupportedNetworks,
  expiryMs = ONE_HOUR_IN_MS
): void => {
  if (!config.USE_CACHE || config.USE_CACHE === 'false') {
    return;
  }

  const isRedisCache = !!config.REDIS_URL;
  const currentNetwork = network || DEFAULT_NETWORK.network;

  const path = getFilePath(name, currentNetwork);

  try {
    if (isRedisCache && redis) {
      // If redis cache is enabled, store in redis, with a TTL in seconds
      const expirySeconds = Math.round(expiryMs / 1000);
      logger.debug(`Redis cache set for ${path}, with TTL ${expirySeconds} seconds`);

      redis.set(path, data, 'EX', expirySeconds);
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
    logger.error(`CacheSet: Error storing data in cache, ${name} - ${network}`, e.message);
  }
};
