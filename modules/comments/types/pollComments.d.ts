import { SupportedNetworks } from 'modules/web3/web3.constants';

export type PollComment = {
  voterAddress: string;
  delegateAddress?: string;
  voteProxyAddress?: string;
  comment: string;
  date: Date;
  pollId: number;
  network: SupportedNetworks;
  txHash?: string;
};

export type PollCommentFromDB = PollComment & {
  _id: string;
};

export type PollsCommentsRequestBody = {
  voterAddress: string;
  delegateAddress?: string;
  comments: Partial<PollComment>[];
  voteProxyAddress?: string;
  rawMessage: string;
  signedMessage: string;
  txHash: string;
};

export type PollCommentWithWeight = PollComment & {
  voterWeight: BigNumber;
};
