import { Web3Provider, getDefaultProvider, BaseProvider } from '@ethersproject/providers';
import { SupportedChainId } from 'modules/web3/constants/chainID';
import { useEffect, useState, ReactChild, CSSProperties } from 'react';

import Image from './Image';

export { default as Image } from './Image';

export interface DavatarProps {
  size: number;
  address: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  provider?: any;
  // deprecated
  graphApiKey?: string;
  defaultComponent?: ReactChild | ReactChild[];
  style?: CSSProperties;
}

export default function Davatar({
  size,
  address,
  provider,
  graphApiKey,
  defaultComponent,
  style
}: DavatarProps) {
  const [avatarUri, setAvatarUri] = useState<string | null>(null);
  const [ethersProvider, setEthersProvider] = useState<BaseProvider | null>(null);

  useEffect(() => {
    let eth = getDefaultProvider();
    let chainId;
    let isEthers = false;

    if (provider) {
      if (provider.currentProvider?.chainId) {
        chainId = parseInt(provider.currentProvider.chainId);
      } else if (provider.network?.chainId) {
        isEthers = true;
        chainId = provider.network.chainId;
      }

      if ([1, 3, 4, 5].includes(chainId)) {
        eth = isEthers ? (provider as BaseProvider) : new Web3Provider(provider.currentProvider);
      }

      setEthersProvider(eth);

      if (chainId !== SupportedChainId.GOERLIFORK) {
        eth.lookupAddress(address).then(ensName => {
          if (ensName) {
            eth.getResolver(ensName).then(resolver => {
              resolver &&
                resolver.getText('avatar').then(avatar => {
                  if (avatar && avatar.length > 0) {
                    setAvatarUri(avatar);
                  }
                });
            });
          }
        });
      }
    }
  }, [address, provider]);

  return (
    <Image
      size={size}
      address={address}
      uri={avatarUri}
      graphApiKey={graphApiKey}
      provider={ethersProvider}
      defaultComponent={defaultComponent}
      style={style}
    />
  );
}
