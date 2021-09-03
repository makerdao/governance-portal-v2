import { PollVoteHistory } from 'modules/polls/types';
import { Delegate } from 'modules/delegates/types';

export type AddressAPIStats = {
  pollVoteHistory: PollVoteHistory[];
};

export type AddressApiResponse = {
  isDelegate: boolean;
  isProxyContract: boolean;
  delegateInfo?: Delegate;
  address: string;
  stats: AddressAPIStats;
};
