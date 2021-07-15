import fs from 'fs';
import os from 'os';
import { getNetwork } from 'lib/maker';

// Mem cache does not work on local instances of nextjs because nextjs creates clean memory states each time.
const fsCacheCache = {};

function getFilePath(name: string): string {
  const date = new Date().toISOString().substring(0, 10);

  return `${os.tmpdir()}/gov-portal-${getNetwork()}-${name}-${date}`;
}

export const fsCacheDel = (path: string): void => {
  console.log('Delete cache', path);
  fs.unlinkSync(path);
  fsCacheCache[path] = null;
};

export const fsCacheGet = (name: string, expiryMs?: number): any => {
  const path = getFilePath(name);
  const memCached = fsCacheCache[path];
  
  if (memCached) {
    console.log(`mem cache hit: ${path}`);

    if (memCached.expiry && memCached.expiry < Date.now()) {
      console.log('mem cache expired');
      fsCacheDel(path);
      return null;
    }

    return fsCacheCache[path].data;
  }

  if (fs.existsSync(path)) {
    // In nextjs serverless instances of API functions sometimes reset their in memory cache (they are different instances)
    // In order to have an expiry date we can also check the last time this file was accessed or it was created. This conditions having to pass the expiryMs on the cacheGet too
    const { birthtime } = fs.statSync(path);

    if (expiryMs && birthtime && birthtime.getTime() < Date.now() + expiryMs) {
      fsCacheDel(path);
      return null;
    }
    
    console.log(`fs cache hit: ${path}`);
    return fs.readFileSync(path).toString();
  }
};

export const fsCacheSet = (name: string, data: any, expiryMs?: number): void => {
  try {
    
    const path = getFilePath(name);
    console.log('fs cache set', path);
    fs.writeFileSync(path, data);

    fsCacheCache[path] = {
      expiry: expiryMs ? Date.now() + expiryMs : null,
      data
    };
  } catch (e) {
    console.error(e);
  }
};
