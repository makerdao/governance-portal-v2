import { isAddress } from 'ethers/lib/utils';

export const isValidAddressParam = (address: string): boolean => {
  return isAddress(address);
};
