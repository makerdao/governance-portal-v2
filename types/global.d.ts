/* eslint-disable no-unused-vars */
import Maker from '@makerdao/dai';

declare global {
  interface Window {
    maker?: Maker;
    ethereum?: any;
  }
  namespace NodeJS {
    interface ProcessEnv {
      REACT_APP_GRO_API_BASE_URL: string | undefined;
      REACT_APP_ETHEREUM_NETWORK: TpMetaMaskSupportNetworks | undefined;
    }
  }
}
