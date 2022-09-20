import { ZERO_ADDRESS } from 'modules/web3/constants/addresses';
import { EthSdk } from 'modules/web3/types/contracts';

export async function getDelegateContractAddress(
  contracts: EthSdk,
  address: string
): Promise<string | undefined> {
  const voteDelegateAdress = await contracts.voteDelegateFactory.delegates(address);
  return voteDelegateAdress !== ZERO_ADDRESS ? voteDelegateAdress : undefined;
}
