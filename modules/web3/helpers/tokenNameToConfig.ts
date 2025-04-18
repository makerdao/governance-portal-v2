import { mkrConfig } from 'modules/contracts/generated';
import { TokenName } from '../types/tokens';

export const tokenNameToConfig = (token: TokenName) => {
  if (token === 'mkr') return mkrConfig;
};
