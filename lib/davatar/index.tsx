import { SupportedChainId } from 'modules/web3/constants/chainID';
import { useActiveWeb3React } from 'modules/web3/hooks/useActiveWeb3React';
import { useEffect, useState, ReactChild, CSSProperties } from 'react';

import Image from './Image';

export { default as Image } from './Image';

export interface DavatarProps {
  size: number;
  address: string;
  defaultComponent?: ReactChild | ReactChild[];
  style?: CSSProperties;
}

export default function Davatar({ size, address, defaultComponent, style }: DavatarProps): JSX.Element {
  const { chainId, provider } = useActiveWeb3React();
  const [avatarUri, setAvatarUri] = useState<string | null>(null);

  useEffect(() => {
    if (provider) {
      if (chainId !== SupportedChainId.GOERLIFORK) {
        provider.lookupAddress(address).then(ensName => {
          if (ensName) {
            provider.getResolver(ensName).then(resolver => {
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
      provider={provider}
      defaultComponent={defaultComponent}
      style={style}
    />
  );
}
