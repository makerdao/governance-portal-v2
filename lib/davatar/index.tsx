import { Web3Provider, getDefaultProvider, BaseProvider } from '@ethersproject/providers';
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
  generatedAvatarType?: 'jazzicon' | 'blockies';
  defaultComponent?: ReactChild | ReactChild[];
  style?: CSSProperties;
}

export default function Davatar({
  size,
  address,
  provider,
  graphApiKey,
  generatedAvatarType,
  defaultComponent,
  style
}: DavatarProps) {
  const [avatarUri, setAvatarUri] = useState<string | null>(null);
  const [ethersProvider, setEthersProvider] = useState<BaseProvider | null>(null);

  useEffect(() => {
    let eth = getDefaultProvider();
    let chainId: any = null;
    let isEthers = false;

    // carlos: Only use the provided provider if ENS is actually on that chain
    if (provider) {
      if (provider.currentProvider?.chainId) {
        chainId = parseInt(provider.currentProvider.chainId);
      } else if (provider.network?.chainId) {
        isEthers = true;
        chainId = provider.network.chainId;
      }

      if ([1, 3, 4, 5].includes(chainId)) {
        eth = isEthers ? (provider as BaseProvider) : new Web3Provider(provider.currentProvider);
      } else {
        chainId = 1;
      }
    }

    setEthersProvider(eth);

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
  }, [address, provider]);

  return (
    <Image
      size={size}
      address={address}
      uri={avatarUri}
      graphApiKey={graphApiKey}
      provider={ethersProvider}
      generatedAvatarType={generatedAvatarType}
      defaultComponent={defaultComponent}
      style={style}
    />
  );
}
