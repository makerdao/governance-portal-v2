import { createConfig, createStorage, fallback, http, noopStorage } from 'wagmi';
import { arbitrum, arbitrumSepolia, mainnet } from 'wagmi/chains';
import { SupportedChainId } from 'modules/web3/constants/chainID';
import { coinbaseWallet, metaMask, safe, walletConnect } from 'wagmi/connectors';
import { createPublicClient } from 'viem';

export const tenderly = {
  id: SupportedChainId.TENDERLY as const,
  name: 'mainnet_sep_30_0',
  network: 'tenderly',
  iconUrl: 'tokens/weth.svg',
  nativeCurrency: {
    decimals: 18,
    name: 'Ethereum',
    symbol: 'ETH'
  },
  rpcUrls: {
    public: { http: [`https://virtual.mainnet.rpc.tenderly.co/${process.env.NEXT_PUBLIC_TENDERLY_RPC_KEY}`] },
    default: { http: [`https://virtual.mainnet.rpc.tenderly.co/${process.env.NEXT_PUBLIC_TENDERLY_RPC_KEY}`] }
  },
  blockExplorers: {
    default: { name: '', url: '' }
  }
};

const connectors = [
  metaMask(),
  walletConnect({
    name: 'Sky Governance Portal',
    projectId: process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID || 'd5c6af7c0680adbaad12f33744ee4413'
  }),
  coinbaseWallet(),
  safe()
];

export const wagmiConfigDev = createConfig({
  chains: [mainnet, tenderly],
  ssr: true,
  connectors,
  transports: {
    [mainnet.id]: fallback([
      http(`https://mainnet.infura.io/v3/${process.env.INFURA_KEY}`),
      http(`https://eth-mainnet.g.alchemy.com/v2/${process.env.ALCHEMY_KEY}`)
    ]),
    [tenderly.id]: http(`https://virtual.mainnet.rpc.tenderly.co/${process.env.NEXT_PUBLIC_TENDERLY_RPC_KEY}`)
  },
  multiInjectedProviderDiscovery: false,
  storage: createStorage({
    storage: typeof window !== 'undefined' && window.localStorage ? window.localStorage : noopStorage,
    key: 'wagmi-dev'
  })
});

export const wagmiConfigProd = createConfig({
  chains: [mainnet],
  ssr: true,
  connectors,
  transports: {
    [mainnet.id]: fallback([
      http(`https://mainnet.infura.io/v3/${process.env.INFURA_KEY}`),
      http(`https://eth-mainnet.g.alchemy.com/v2/${process.env.ALCHEMY_KEY}`)
    ])
  },
  multiInjectedProviderDiscovery: false
});

export const mainnetPublicClient = createPublicClient({
  chain: mainnet,
  transport: fallback([
    http(`https://mainnet.infura.io/v3/${process.env.INFURA_KEY}`),
    http(`https://eth-mainnet.g.alchemy.com/v2/${process.env.ALCHEMY_KEY}`)
  ]),
  key: 'mainnet-public-client',
  name: 'Mainnet public client'
});

export const tenderlyPublicClient = createPublicClient({
  chain: tenderly,
  transport: http(`https://virtual.mainnet.rpc.tenderly.co/${process.env.NEXT_PUBLIC_TENDERLY_RPC_KEY}`),
  key: 'tenderly-public-client',
  name: 'Tenderly public client'
});

export const arbitrumPublicClient = createPublicClient({
  chain: arbitrum,
  transport: http(`https://arb-mainnet.g.alchemy.com/v2/${process.env.NEXT_PUBLIC_ALCHEMY_ARBITRUM_KEY}`),
  key: 'arbitrum-public-client',
  name: 'Arbitrum public client'
});

export const arbitrumTestnetPublicClient = createPublicClient({
  chain: arbitrumSepolia,
  transport: http(
    `https://arb-sepolia.g.alchemy.com/v2/${process.env.NEXT_PUBLIC_ALCHEMY_ARBITRUM_TESTNET_KEY}`
  ),
  key: 'arbitrum-testnet-public-client',
  name: 'Arbitrum Testnet public client'
});
