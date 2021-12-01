import { PollVoteHistory } from 'modules/polling/types';
import { Delegate } from 'modules/delegates/types';

export type AddressAPIStats = {
  pollVoteHistory: PollVoteHistory[];
  lastVote: PollVoteHistory;
};

export type VoteProxyInfo = {
  voteProxyAddress: string;
  hot: string;
  cold: string;
};

export type AddressApiResponse = {
  isDelegate: boolean;
  isProxyContract: boolean;
  voteProxyInfo?: VoteProxyInfo;
  delegateInfo?: Delegate;
  address: string;
};
