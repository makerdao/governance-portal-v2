import { Chief } from '.dethcrypto/eth-sdk-client/esm/types';
import { formatUnits } from 'ethers/lib/utils';
import { MKR } from 'lib/maker';
import { CurrencyObject } from 'modules/app/types/currency';

export const getChiefDeposits = async (address: string, contract: Chief): Promise<CurrencyObject> => {
  //TODO: refactor all the places where we currently expect MKR currency to handle an ethers BN
  const deposits = await contract.deposits(address);
  return MKR(formatUnits(deposits));
};
