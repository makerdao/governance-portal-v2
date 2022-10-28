import { SupportedNetworks } from 'modules/web3/constants/networks';
import { Relayer } from 'defender-relay-client';
import { relayerCredentials } from '../helpers/relayerCredentials';

export const getRelayerTx = async (
  txId: string,
  network: SupportedNetworks
): Promise<any> /* type this to relayer tx */ => {
  const sdkNetwork = network === SupportedNetworks.GOERLIFORK ? SupportedNetworks.GOERLI : network;
  const relayer = new Relayer(relayerCredentials[sdkNetwork]);
  const latestTx = await relayer.query(txId);

  return latestTx;
};
