import { Web3Provider } from '@ethersproject/providers';

export async function sign(address: string, message: string, provider: Web3Provider): Promise<any> {
  return provider.send('personal_sign', [message, address]);
}
