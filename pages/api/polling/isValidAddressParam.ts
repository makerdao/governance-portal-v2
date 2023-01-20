import { isAddress } from 'ethers/lib/utils';

export const isValidAddressParam = (address: string): Boolean => {
  return isAddress(address);
};
