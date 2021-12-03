import { Delegate } from './delegate';

export type DelegatesAPIStats = {
  total: number;
  shadow: number;
  recognized: number;
  totalMKRDelegated: number;
};

export type DelegatesAPIResponse = {
  delegates: Delegate[];
  stats: DelegatesAPIStats;
  pagination?: {
    page: number;
    pageSize: number;
  };
};

export type MKRLockedDelegateAPIResponse = {
  fromAddress: string;
  lockAmount: string;
  blockNumber: number;
  blockTimestamp: string;
  lockTotal: string;
};

export type MKRDelegatedToDAIResponse = MKRLockedDelegateAPIResponse & {
  hash: string;
  immediateCaller: string;
};
