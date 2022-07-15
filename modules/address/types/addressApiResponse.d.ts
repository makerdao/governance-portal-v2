import { PollVoteHistory } from 'modules/polling/types';
import { Delegate } from 'modules/delegates/types';
import { VoteProxyAddresses } from 'modules/app/helpers/getVoteProxyAddresses';

export type AddressAPIStats = {
  pollVoteHistory: PollVoteHistory[];
  lastVote: PollVoteHistory;
};

export type AddressApiResponse = {
  isDelegate: boolean;
  isProxyContract: boolean;
  voteProxyInfo?: VoteProxyAddresses;
  delegateInfo?: Delegate;
  address: string;
  voteDelegateAdress?: string;
};
