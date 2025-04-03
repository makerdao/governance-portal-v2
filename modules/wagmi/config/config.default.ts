import { createConfig, createStorage, http, noopStorage } from 'wagmi';
import { arbitrum, arbitrumSepolia, mainnet } from 'wagmi/chains';
import { SupportedChainId } from 'modules/web3/constants/chainID';
import { coinbaseWallet, metaMask, safe, walletConnect, injected } from 'wagmi/connectors';
import { createPublicClient } from 'viem';

const tenderlyRpcUrl = `https://virtual.mainnet.rpc.tenderly.co/${process.env.NEXT_PUBLIC_TENDERLY_RPC_KEY}`;

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
    public: { http: [tenderlyRpcUrl] },
    default: { http: [tenderlyRpcUrl] }
  },
  blockExplorers: {
    default: { name: '', url: '' }
  },
  contracts: mainnet.contracts
};

const httpBatchTransport = (url: string) =>
  http(url, {
    batch: { wait: 500 }
  });

const transports = {
  [mainnet.id]: httpBatchTransport(`https://eth-mainnet.g.alchemy.com/v2/${process.env.ALCHEMY_KEY}`),
  [tenderly.id]: httpBatchTransport(tenderlyRpcUrl),
  [arbitrum.id]: httpBatchTransport(
    `https://arb-mainnet.g.alchemy.com/v2/${process.env.NEXT_PUBLIC_ALCHEMY_ARBITRUM_KEY}`
  ),
  [arbitrumSepolia.id]: httpBatchTransport(
    `https://arb-sepolia.g.alchemy.com/v2/${process.env.NEXT_PUBLIC_ALCHEMY_ARBITRUM_TESTNET_KEY}`
  )
};

const connectors = [
  metaMask(),
  injected({
    target() {
      return {
        id: 'injected',
        name: 'Browser Wallet',
        provider(window) {
          return window?.ethereum;
        }
      };
    }
  }),
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
    [mainnet.id]: transports[mainnet.id],
    [tenderly.id]: transports[tenderly.id]
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
    [mainnet.id]: transports[mainnet.id]
  },
  multiInjectedProviderDiscovery: false
});

export const mainnetPublicClient = createPublicClient({
  chain: mainnet,
  transport: transports[mainnet.id],
  key: 'mainnet-public-client',
  name: 'Mainnet public client'
});

export const tenderlyPublicClient = createPublicClient({
  chain: tenderly,
  transport: transports[tenderly.id],
  key: 'tenderly-public-client',
  name: 'Tenderly public client'
});

export const arbitrumPublicClient = createPublicClient({
  chain: arbitrum,
  transport: transports[arbitrum.id],
  key: 'arbitrum-public-client',
  name: 'Arbitrum public client'
});

export const arbitrumTestnetPublicClient = createPublicClient({
  chain: arbitrumSepolia,
  transport: transports[arbitrumSepolia.id],
  key: 'arbitrum-testnet-public-client',
  name: 'Arbitrum Testnet public client'
});
