import { ethers } from 'ethers';
import { isValid, format } from 'date-fns';
import { DecodedDiffAPIResponse, SimulationDiffAPIResponse, SpellDiff } from '../types';
// import { DecodedDiffAPIResponse, SimulationDiffAPIResponse, SpellDiff } from '../types';

// Standardize the diff properties and use the decoded ones when available
export const validateDiff = (diff: DecodedDiffAPIResponse | SimulationDiffAPIResponse): SpellDiff => ({
  contract: (diff as DecodedDiffAPIResponse).decoded_contract ?? diff.contract,
  location: (diff as DecodedDiffAPIResponse).decoded_location ?? diff.location,
  fromVal: (diff as DecodedDiffAPIResponse).decoded_from_val ?? diff.from_val,
  toVal: (diff as DecodedDiffAPIResponse).decoded_to_val ?? diff.to_val
});

export const formatLocation = location => {
  if (location.indexOf(']') !== -1) {
    const mapKey = location.slice(location.indexOf('[') + 1, location.indexOf(']'));
    if (ethers.utils.isAddress(mapKey)) console.log('mapkey is address', mapKey);
    else if (isNaN(parseInt(mapKey))) console.log('mapkey is a contract', mapKey);
    else console.log('mapkey is an ID', mapKey);
  }
  return location;
};

export const formatValue = value => {
  if (value.indexOf('16') === 0 && isValid(new Date(parseInt(value) * 1000))) {
    console.log('date', new Date(parseInt(value) * 1000));
    return { interpreted: format(new Date(parseInt(value) * 1000), 'MM/dd/yyyy') };
  }
  return value;
};
