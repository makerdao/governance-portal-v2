import { Web3Provider } from '@ethersproject/providers';

export async function sign(address: string, message: string, provider: Web3Provider): Promise<any> {
  const signer = provider.getSigner(address);
  return signer.signMessage(message);
}
