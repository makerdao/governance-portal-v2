function hasLocalStorage(): boolean {
  return typeof window !== 'undefined' && !!window.localStorage;
}

export const localStorage = {
  get: (key: string, json?: boolean): any => {
    if (hasLocalStorage()) {
      const expiryMS = window.localStorage.getItem(`${key}-expiry`);

      // Check if it has a expiration key
      if (expiryMS) {
        if (Date.now() > parseInt(expiryMS)) {
          window.localStorage.removeItem(key);
          window.localStorage.removeItem(`${key}-expiry`);

          return null;
        }
      }
      const item = window.localStorage.getItem(key);

      if (json) {
        try {
          return JSON.parse(item || '');
        } catch (e) {
          return null;
        }
      } else {
        return item;
      }
    }

    return null;
  },
  remove: (key: string): void => {
    if (hasLocalStorage()) {
      window.localStorage.removeItem(key);
    }
  },
  set: (key: string, value: string, expiryMS?: number): void => {
    if (hasLocalStorage()) {
      window.localStorage.setItem(key, value);
      if (expiryMS) {
        window.localStorage.setItem(`${key}-expiry`, (Date.now() + expiryMS).toString());
      }
    }
  }
};
