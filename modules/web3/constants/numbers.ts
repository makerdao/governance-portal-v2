import { BigNumber } from 'ethers';
import { BigNumberJS } from 'lib/bigNumberJs';

export const WAD = BigNumber.from('1000000000000000000');
export const RAY = BigNumber.from('1000000000000000000000000000');
export const RAD = BigNumber.from('1000000000000000000000000000000000000000000000');

export const BigNumberWAD = new BigNumberJS('1e18');
export const BigNumberRAY = new BigNumberJS('1e27');
export const BigNumberRAD = new BigNumberJS('1e45');
