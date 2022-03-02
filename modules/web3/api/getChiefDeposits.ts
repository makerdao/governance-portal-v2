import { Chief } from '.dethcrypto/eth-sdk-client/esm/types';
import { BigNumber } from 'ethers';

export const getChiefDeposits = async (address: string, contract: Chief): Promise<BigNumber> => {
  const deposits = await contract.deposits(address);
  return deposits;
};
