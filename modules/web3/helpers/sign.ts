import { providers } from 'ethers';

export async function sign(address: string, message: string, provider: providers.Web3Provider): Promise<any> {
  const signer = provider.getSigner(address);
  return signer.signMessage(message);
}
