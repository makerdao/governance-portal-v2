import { SupportedNetworks } from 'modules/web3/constants/networks';

export type PollComment = {
  voterAddress: string;
  hotAddress: string;
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
  hotAddress: string;
  comments: Partial<PollComment>[];
  signedMessage: string;
  txHash: string;
};

export type PollCommentWithWeight = PollComment & {
  voterWeight: BigNumber;
};
