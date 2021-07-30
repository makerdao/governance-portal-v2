function hasLocalStorage(): boolean {
  return typeof window !== 'undefined' && !!window.localStorage;
}

export const localStorage = {
  get: (key: string, json?: boolean): any => {
    if (hasLocalStorage()) {
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
  set: (key: string, value: string): void => {
    if (hasLocalStorage()) {
      window.localStorage.setItem(key, value);
    }
  }
};
