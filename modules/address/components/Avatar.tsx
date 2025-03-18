/*

SPDX-FileCopyrightText: © 2023 Dai Foundation <www.daifoundation.org>

SPDX-License-Identifier: AGPL-3.0-or-later

*/

import { SupportedChainId } from 'modules/web3/constants/chainID';
import { useWeb3 } from 'modules/web3/hooks/useWeb3';
import { useEffect, useCallback, useState, ReactChild, CSSProperties } from 'react';
import { AvatarResolver } from '@ensdomains/ens-avatar';
import Jazzicon from './Jazzicon';
import logger from 'lib/logger';

export interface AvatarProps {
  size: number;
  address: string;
  defaultComponent?: ReactChild | ReactChild[];
  style?: CSSProperties;
}

export function Avatar({ size, address, defaultComponent, style }: AvatarProps): JSX.Element {
  const { chainId, provider: library } = useWeb3();
  const [avatarUri, setAvatarUri] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;

    const fetchAvatarUri = async () => {
      if (library && address && chainId !== SupportedChainId.TENDERLY) {
        const avt = new AvatarResolver(library, { cache: 3600 /* cache for an hour */ });
        try {
          const ensName = await library.lookupAddress(address);
          if (ensName) {
            const uri = await avt.getAvatar(ensName, {});
            if (uri && mounted) {
              setAvatarUri(uri);
            }
          }
        } catch (err) {
          logger.error(err);
        }
      }
    };

    fetchAvatarUri();
    return () => {
      mounted = false;
    };
  }, [address, library]);

  const [loaded, setLoaded] = useState(false);

  const onLoad = useCallback(() => {
    setLoaded(true);
  }, [address, avatarUri]);
  let avatarImg: any | null = null;

  const cssStyle = {
    display: loaded ? undefined : 'none',
    width: `${size}px`,
    height: `${size}px`,
    borderRadius: `${size}px`,
    ...(style || {})
  };

  if (avatarUri) {
    avatarImg = <img alt="avatar" style={cssStyle} src={avatarUri} onLoad={onLoad} />;
  }

  const defaultAvatar =
    (!avatarUri || !loaded) && address && (defaultComponent || <Jazzicon address={address} size={size} />);

  return (
    <>
      {defaultAvatar}
      {avatarImg}
    </>
  );
}
