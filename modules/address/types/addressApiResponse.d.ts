import { PollVoteHistory } from 'modules/polls/types/pollVoteHistory';
import { Delegate } from 'types/delegate';

export type AddressAPIStats =  {
  pollVoteHistory: PollVoteHistory[]
}

export type AddressApiResponse = {
  isDelegate: boolean,
  delegateInfo?: Delegate,
  address: string,
  stats: AddressAPIStats
}