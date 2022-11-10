import { ethers } from 'ethers';

export function verifyTypedSignature(domain, types, message, signature) {
  return ethers.utils.verifyTypedData(domain, types, message, signature);
}
