import { Delegate } from './delegate';

export type DelegatesAPIStats = {
  total: number,
  shadow: number,
  recognized: number,
  totalMKRDelegated: number
}

export type DelegatesAPIResponse = {
  delegates: Delegate[],
  stats: DelegatesAPIStats,
  pagination?: {
    page: number,
    pageSize: number,
  }
}