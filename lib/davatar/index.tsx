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
  const { chainId, library } = useActiveWeb3React();
  const [avatarUri, setAvatarUri] = useState<string | null>(null);

  useEffect(() => {
    if (library) {
      if (chainId !== SupportedChainId.GOERLIFORK) {
        library.lookupAddress(address).then(ensName => {
          if (ensName) {
            library.getResolver(ensName).then(resolver => {
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
  }, [address, library]);

  return (
    <Image
      size={size}
      address={address}
      uri={avatarUri}
      provider={library}
      defaultComponent={defaultComponent}
      style={style}
    />
  );
}
