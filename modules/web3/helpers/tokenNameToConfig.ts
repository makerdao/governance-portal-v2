import { mkrConfig, skyConfig } from 'modules/contracts/generated';
import { TokenName } from '../types/tokens';

export const tokenNameToConfig = (token: TokenName) => {
  if (token === 'mkr') return mkrConfig;
  if (token === 'sky') return skyConfig;
};
