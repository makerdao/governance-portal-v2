/* eslint-disable no-unused-vars */
declare global {
  interface Window {
    ethereum?: any;
    setAccount: (address: string, key: string) => void;
  }
  namespace NodeJS {
    interface Global {
      document: Document;
      window: Window;
      navigator: Navigator;
    }
  }
}
