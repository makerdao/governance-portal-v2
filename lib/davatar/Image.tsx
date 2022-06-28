import { Contract } from '@ethersproject/contracts';
import { BaseProvider } from '@ethersproject/providers';
import BigNumber from 'bn.js';
import { fetchJson } from 'lib/fetchJson';
import { useState, useEffect, useCallback, CSSProperties, ReactChild } from 'react';
import Jazzicon from './Jazzicon';

// 24 hour TTL
const CACHE_TTL = 60 * 60 * 24 * 1000;

const erc721Abi = [
  'function ownerOf(uint256 tokenId) view returns (address)',
  'function tokenURI(uint256 _tokenId) external view returns (string)'
];

const erc1155Abi = [
  'function balanceOf(address _owner, uint256 _id) view returns (uint256)',
  'function uri(uint256 _id) view returns (string)'
];

export interface Props {
  size: number;
  uri?: string | null;
  address?: string | null;
  style?: CSSProperties;
  className?: string;
  provider?: BaseProvider | null;
  defaultComponent?: ReactChild | ReactChild[];
}

export const getCachedUrl = (key: string): string | null => {
  const normalizedKey = key.toLowerCase();
  const cachedItem = window.localStorage.getItem(`davatar/${normalizedKey}`);

  if (cachedItem) {
    const item = JSON.parse(cachedItem);

    if (new Date(item.expiresAt) > new Date()) {
      return getGatewayUrl(item.url);
    }
  }

  return null;
};

export const getGatewayUrl = (uri: string, tokenId?: string): string => {
  const match = new RegExp(/([a-z]+)(?::\/\/|\/)(.*)/).exec(uri);

  if (!match || match.length < 3) {
    return uri;
  }

  const id = match[2];
  let url = uri;

  switch (match[1]) {
    case 'ar': {
      url = `https://arweave.net/${id}`;
      break;
    }
    case 'ipfs':
      if (id.includes('ipfs') || id.includes('ipns')) {
        url = `https://gateway.ipfs.io/${id}`;
      } else {
        url = `https://gateway.ipfs.io/ipfs/${id}`;
      }
      break;
    case 'ipns':
      if (id.includes('ipfs') || id.includes('ipns')) {
        url = `https://gateway.ipfs.io/${id}`;
      } else {
        url = `https://gateway.ipfs.io/ipns/${id}`;
      }
      break;
    case 'http':
    case 'https':
      break;
  }

  return tokenId ? url.replaceAll('{id}', tokenId) : url;
};

export default function Avatar({
  uri,
  style,
  className,
  size,
  address,
  provider,
  defaultComponent
}: Props): JSX.Element {
  const [url, setUrl] = useState<string | null>(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    try {
      if (!uri && address) {
        const cachedUrl = getCachedUrl(address.toLowerCase());
        if (cachedUrl) {
          setUrl(cachedUrl);
        }
      }

      if (!uri) {
        return;
      }

      if (uri) {
        const cachedUrl = getCachedUrl(uri);
        if (cachedUrl) {
          setUrl(cachedUrl);
        }
      }

      if (uri && address) {
        const cachedUrl = getCachedUrl(`${address.toLowerCase()}/${uri}`);
        if (cachedUrl) {
          setUrl(cachedUrl);
        }
      }

      const match = new RegExp(/([a-z]+):\/\/(.*)/).exec(uri);
      const match721 = new RegExp(/eip155:1\/erc721:(\w+)\/(\w+)/).exec(uri);
      const match1155 = new RegExp(/eip155:1\/erc1155:(\w+)\/(\w+)/).exec(uri);

      if (match && match.length === 3) {
        const protocol = match[1];
        const id = match[2];

        switch (protocol) {
          case 'ar': {
            const baseUrl = 'https://arweave.net';

            fetch(`${baseUrl}/graphql`, {
              method: 'POST',
              headers: {
                'content-type': 'application/json;charset=UTF-8'
              },
              body: JSON.stringify({
                query: `
                {
                  transactions(ids: ["${id}"]) {
                    edges {
                      node {
                        id
                        owner {
                          address
                        }
                      }
                    }
                  }
                }
                `
              })
            })
              .then(d => d.json())
              .then(res => res.data.transactions.edges[0].node)
              .then(tx =>
                fetch(`${baseUrl}/graphql`, {
                  method: 'POST',
                  headers: {
                    'content-type': 'application/json;charset=UTF-8'
                  },
                  body: JSON.stringify({
                    query: `
                  {
                    transactions(owners: ["${tx.owner.address}"], tags: { name: "Origin", values: ["${tx.id}"] }, sort: HEIGHT_DESC) {
                      edges {
                        node {
                          id
                        }
                      }
                    }
                  }
                  `
                  })
                })
              )
              .then(res => res.json())
              .then(res => {
                if (res.data && res.data.transactions.edges.length > 0) {
                  setUrl(`${baseUrl}/${res.data.transactions.edges[0].node.id}`);
                } else {
                  setUrl(`${baseUrl}/${id}`);
                }
              })
              .catch(e => console.error(e)); // eslint-disable-line

            break;
          }
          case 'ipfs':
            setUrl(`https://gateway.ipfs.io/ipfs/${id}`);
            break;
          case 'ipns':
            setUrl(`https://gateway.ipfs.io/ipns/${id}`);
            break;
          case 'http':
          case 'https':
            setUrl(uri);
            break;
          default:
            setUrl(uri);
            break;
        }
      } else if (match721 && match721.length === 3) {
        const contractId = match721[1].toLowerCase();
        const tokenId = match721[2];
        const normalizedAddress = address?.toLowerCase();

        if (provider) {
          const erc721Contract = new Contract(contractId, erc721Abi, provider);

          (async () => {
            if (normalizedAddress) {
              const owner = await erc721Contract.ownerOf(tokenId);

              if (!owner || owner.toLowerCase() !== normalizedAddress) {
                // throw new Error('ERC721 token not owned by address');
                return null;
              }
            }

            const tokenURI = await erc721Contract.tokenURI(tokenId);
            const gatewayUrl = getGatewayUrl(tokenURI, new BigNumber(tokenId).toString(16));
            try {
              const data = await fetchJson(`/api/delegates/davatar/image?gatewayUrl=${gatewayUrl}`);
              setUrl(getGatewayUrl(data.image));
            } catch (e) {
              console.error(`Error fetching image from ${gatewayUrl}`, e);
            }
          })();
        }
      } else if (match1155 && match1155.length === 3) {
        const contractId = match1155[1].toLowerCase();
        const tokenId = match1155[2];

        if (provider) {
          const erc1155Contract = new Contract(contractId, erc1155Abi, provider);

          (async () => {
            if (address) {
              const balance: BigNumber = await erc1155Contract.balanceOf(address, tokenId);
              if (balance.isZero()) {
                // throw new Error('ERC1155 token not owned by address');
                return null;
              }
            }

            const tokenURI = await erc1155Contract.uri(tokenId);
            const res = await fetch(getGatewayUrl(tokenURI, new BigNumber(tokenId).toString(16)));
            const data = (await res.json()) as { image: string };
            setUrl(getGatewayUrl(data.image));
          })();
        }
      } else {
        setUrl(getGatewayUrl(uri));
      }
    } catch (e) {
      console.error(e);
    }
  }, [uri, address, provider]);

  const onLoad = useCallback(() => {
    setLoaded(true);

    if (address) {
      const normalizedAddress = address.toLowerCase();
      const cachedItem = window.localStorage.getItem(normalizedAddress);
      const item = cachedItem && JSON.parse(cachedItem);

      if (!item || new Date(item.expiresAt) > new Date()) {
        const expireDate = new Date(new Date().getTime() + CACHE_TTL);

        window.localStorage.setItem(
          `davatar/${normalizedAddress}`,
          JSON.stringify({ url, expiresAt: expireDate })
        );
        window.localStorage.setItem(
          `davatar/${normalizedAddress}/${uri}`,
          JSON.stringify({ url, expiresAt: expireDate })
        );
      }
    }
  }, [address, url, uri]);

  let avatarImg: any | null = null;

  const cssStyle = {
    display: loaded ? undefined : 'none',
    width: `${size}px`,
    height: `${size}px`,
    borderRadius: `${size}px`,
    ...(style || {})
  };

  if (url) {
    avatarImg = <img alt="avatar" style={cssStyle} className={className} src={url} onLoad={onLoad} />;
  }

  const defaultAvatar =
    (!url || !loaded) && address && (defaultComponent || <Jazzicon address={address} size={size} />);

  return (
    <>
      {defaultAvatar}
      {avatarImg}
    </>
  );
}
