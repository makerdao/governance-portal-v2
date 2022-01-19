/* eslint-disable no-unused-vars */
import Maker from '@makerdao/dai';

declare global {
  interface Window {
    maker?: Maker;
    ethereum?: any;
    setAccount: (address: string, key: string) => void;
  }
  namespace NodeJS {
    interface ProcessEnv {
      REACT_APP_GRO_API_BASE_URL: string | undefined;
      REACT_APP_ETHEREUM_NETWORK: TpMetaMaskSupportNetworks | undefined;
    }
    interface Global {
      document: Document;
      window: Window;
      navigator: Navigator;
      __TESTCHAIN__: boolean | undefined;
    }
  }
}
