import { SupportedNetworks } from "../constants";

export function networkToRpc(network: SupportedNetworks) {
  switch (network) {
    case SupportedNetworks.MAINNET:
      return `https://mainnet.infura.io/v3/${process.env.INFURA_KEY}`;
    case SupportedNetworks.KOVAN:
      return `https://kovan.infura.io/v3/${process.env.INFURA_KEY}`;
    case SupportedNetworks.TESTNET:
      return `http://localhost:2000`;
    default:
      return `https://mainnet.infura.io/v3/${process.env.INFURA_KEY}`;
  }
}
