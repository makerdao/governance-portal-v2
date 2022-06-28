import { BigNumber } from 'ethers';
import { BigNumber as BigNumberJs } from 'lib/bigNumberJs';

export const WAD = BigNumber.from('1000000000000000000');
export const RAY = BigNumber.from('1000000000000000000000000000');
export const RAD = BigNumber.from('1000000000000000000000000000000000000000000000');

export const BigNumberWAD = new BigNumberJs('1e18');
export const BigNumberRAY = new BigNumberJs('1e27');
export const BigNumberRAD = new BigNumberJs('1e45');
