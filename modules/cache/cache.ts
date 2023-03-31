/*

SPDX-FileCopyrightText: © 2023 Dai Foundation <www.daifoundation.org>

SPDX-License-Identifier: AGPL-3.0-or-later

*/

import fs from 'fs';
import os from 'os';
import { DEFAULT_NETWORK, SupportedNetworks } from 'modules/web3/constants/networks';
import { config } from 'lib/config';
import Redis from 'ioredis';
import packageJSON from '../../package.json';
import logger from 'lib/logger';
import { ONE_HOUR_IN_MS } from 'modules/app/constants/time';
import { executiveProposalsCacheKey } from './constants/cache-keys';

let isConnected = true;

const redis = config.REDIS_URL
  ? new Redis(config.REDIS_URL, {
      connectTimeout: 10000
    })
  : null;

if (redis) {
  redis.on('error', error => {
    logger.error(error.message);
    // TODO: Handle error and find better ways to manage reconnects and redis connection status (TODO: Read ioRedis docs)
    isConnected = false;
  });
}

const redisCacheEnabled = () => {
  const isRedisCache = !!config.REDIS_URL;

  return isRedisCache && redis && isConnected;
};

// Mem cache does not work on local instances of nextjs because nextjs creates clean memory states each time.
const memoryCache = {};

function getFilePath(name: string, network: string, extendedTTL = false): string {
  const date = new Date().toISOString().substring(0, 10);

  return `${os.tmpdir()}/gov-portal-version-${packageJSON.version}-${network}-${name}${
    extendedTTL ? '' : '-' + date
  }`;
}

export const cacheDel = (name: string, network: SupportedNetworks, extendedTTL = false): void => {
  const path = getFilePath(name, network, extendedTTL);

  if (redisCacheEnabled()) {
    // if clearing proposals, we need to find all of them first
    if (name === 'proposals') {
      redis?.keys('*proposals*').then(keys => {
        keys.forEach(key => {
          logger.debug('cacheDel key: ', key);
          redis?.del(key);
        });
      });
    } else {
      // otherwise just delete the file based on path
      logger.debug('cacheDel redis: ', path);
      redis?.del(path);
    }
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

  try {
    const currentNetwork = network || DEFAULT_NETWORK.network;
    const path = getFilePath(name, currentNetwork);

    if (redisCacheEnabled()) {
      // if fetching proposals cache info, there are likely multiple keys cached due to different query params
      // we'll return the ttl for first proposals key we find
      if (name === executiveProposalsCacheKey) {
        const keys = await redis?.keys('*proposals*');
        if (keys && keys.length > 0) {
          const ttl = await redis?.ttl(keys[0]);
          return ttl;
        }
      } else {
        const ttl = await redis?.ttl(path);
        return ttl;
      }
    }
  } catch (e) {
    logger.error(e);
  }
};

export const cacheGet = async (
  name: string,
  network?: SupportedNetworks,
  expiryMs?: number,
  extendedTTL = false,
  method: 'GET' | 'HGET' = 'GET',
  field = ''
): Promise<any> => {
  if (!config.USE_CACHE || config.USE_CACHE === 'false') {
    return Promise.resolve(null);
  }

  try {
    const currentNetwork = network || DEFAULT_NETWORK.network;
    const path = getFilePath(name, currentNetwork, extendedTTL);

    if (redisCacheEnabled()) {
      // Get redis data if it exists
      const cachedData = method === 'GET' ? await redis?.get(path) : await redis?.hget(path, field);
      logger.debug(`Redis cache get for ${path}`);
      return cachedData || null;
    } else {
      // If fs does not exist as a module, return null (TODO: This shouldn't happen, consider removing this check)
      if (Object.keys(fs).length === 0) return null;
      const memCached = method === 'GET' ? memoryCache[path] : memoryCache[path]?.[field];

      if (memCached) {
        logger.debug(`mem cache hit: ${path}`);

        if (memCached.expiry && memCached.expiry < Date.now()) {
          logger.debug('mem cache expired');
          cacheDel(name, currentNetwork);
          return null;
        }

        return memCached.data;
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
        return method === 'GET'
          ? fs.readFileSync(path).toString()
          : JSON.parse(fs.readFileSync(path).toString())[field];
      }
    }
  } catch (e) {
    logger.error(`CacheGet: Error getting cached data, ${name} - ${network}`, e.message);
    return null;
  }
};

export const cacheSet = (
  name: string,
  data: string | { [key: number]: string },
  network?: SupportedNetworks,
  expiryMs = ONE_HOUR_IN_MS,
  extendedTTL = false,
  method: 'SET' | 'HSET' = 'SET'
): void => {
  if (!config.USE_CACHE || config.USE_CACHE === 'false') {
    return;
  }

  const currentNetwork = network || DEFAULT_NETWORK.network;

  const path = getFilePath(name, currentNetwork, extendedTTL);

  try {
    if (redisCacheEnabled()) {
      // If redis cache is enabled, store in redis, with a TTL in seconds
      const expirySeconds = Math.round(expiryMs / 1000);
      logger.debug(`Redis cache set for ${path}, with TTL ${expirySeconds} seconds`);

      if (method === 'HSET' && typeof data !== 'string') {
        redis?.hset(path, data, err => {
          if (!err) {
            redis.expire(path, expirySeconds);
          }
        });
      } else {
        const checkedData = typeof data === 'string' ? data : JSON.stringify(data);
        redis?.set(path, checkedData, 'EX', expirySeconds);
      }
    } else {
      // File cache
      if (Object.keys(fs).length === 0) return;

      const checkedData = typeof data === 'string' ? data : JSON.stringify(data);
      fs.writeFileSync(path, checkedData);

      memoryCache[path] = {
        expiry: expiryMs ? Date.now() + expiryMs : null,
        checkedData
      };
    }
  } catch (e) {
    logger.error(`CacheSet: Error storing data in cache, ${name} - ${network}`, e.message);
  }
};
