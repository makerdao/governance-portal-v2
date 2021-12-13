import { SupportedNetworks } from 'lib/constants';

export type PollComment = {
  voterAddress: string;
  delegateAddress?: string;
  comment: string;
  date: Date;
  pollId: number;
  network: SupportedNetworks;
};

export type PollsCommentsRequestBody = {
  voterAddress: string;
  delegateAddress?: string;
  comments: Partial<PollComment>[];
  rawMessage: string;
  signedMessage: string;
  txHash: string;
};

export type PollCommentWithWeight = PollComment & {
  voterWeight: BigNumber;
};
