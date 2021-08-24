import { PaginationOptions } from 'modules/app/types/paginationOptions';

export type VoteActionType = {
  date: number,
  address: string,
  value: string
}


export type StatsAPIResponse = {
  metadata: {
    type: 'voteProxy' | 'address' | 'delegateContract',
    owner: string
  },
  votes: VoteActionType[],
  pagination: PaginationOptions
}