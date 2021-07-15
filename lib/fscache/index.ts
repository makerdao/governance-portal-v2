import fs from 'fs';
import os from 'os';
import { getNetwork } from 'lib/maker';

const fsCacheCache = {};

function getFilePath(name: string): string {
  const date = new Date().toISOString().substring(0, 10);

  return `${os.tmpdir()}/gov-portal-${getNetwork()}-${name}-${date}`;
}

export const fsCacheGet = (name: string): any => {
  const path = getFilePath(name);
  const memCached = fsCacheCache[path];

  if (memCached) {
    console.log(`mem cache hit: ${path}`);

    if (memCached.expiry && memCached.expiry < Date.now()) {
      console.log('Mem cache expired');
      fs.unlinkSync(path);
      fsCacheCache[path] = null;

      return null;
    }

    return fsCacheCache[path].data;
  }

  if (fs.existsSync(path)) {
    console.log(`fs cache hit: ${path}`);
    return fs.readFileSync(path).toString();
  }
};

export const fsCacheSet = (name: string, data: any, expiryMs?: number): void => {
  try {
    const path = getFilePath(name);

    fs.writeFileSync(path, data);

    fsCacheCache[path] = {
      expiry: expiryMs ? Date.now() + expiryMs : null,
      data
    };
  } catch (e) {
    console.error(e);
  }
};
