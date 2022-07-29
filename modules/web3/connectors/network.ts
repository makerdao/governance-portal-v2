import { initializeConnector } from '@web3-react/core';
import { Network } from '@web3-react/network';
import { getRPCFromChainID } from '../helpers/getRPC';
import { SupportedChainId } from '../constants/chainID';

export const [network, hooks] = initializeConnector<Network>(
  actions =>
    new Network({
      actions,
      urlMap: { [SupportedChainId.MAINNET]: getRPCFromChainID(SupportedChainId.MAINNET) }
    })
);
