import { Contract } from 'ethers';
import { DefenderRelayProvider, DefenderRelaySigner } from 'defender-relay-client/lib/ethers';
import { getArbitrumGoerliTestnetSdk } from '@dethcrypto/eth-sdk-client';
import { config } from 'lib/config';

export const getArbitrumPollingContract = (): Contract => {
  const credentials = { apiKey: config.DEFENDER_API_KEY, apiSecret: config.DEFENDER_API_SECRET };
  const provider = new DefenderRelayProvider(credentials);
  const signer = new DefenderRelaySigner(credentials, provider, {
    speed: 'fast'
  });

  const { polling } = getArbitrumGoerliTestnetSdk(signer);

  return polling;
};
