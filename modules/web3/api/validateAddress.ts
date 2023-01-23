import { isAddress } from 'ethers/lib/utils';
import { ApiError } from 'modules/app/api/ApiError';
import validateQueryParam from 'modules/app/api/validateQueryParam';
import { resolveENS } from '../helpers/ens';

// Validates an address or returns the resolution from an ENS name
export async function validateAddress(address: string, error: ApiError): Promise<string> {
  // validate address
  const tempAddress = validateQueryParam(
    address,
    'string',
    {
      defaultValue: null
    },
    n => !!n,
    error
  ) as string;

  const resultAddress = tempAddress.indexOf('.eth') !== -1 ? await resolveENS(tempAddress) : tempAddress;

  // If the ens resolved invalid address, we should throw an error
  if (!resultAddress || !isAddress(resultAddress)) {
    throw error;
  }

  return resultAddress.toLowerCase();
}
