import { SupportedNetworks } from 'lib/constants';

export type PollComment = {
  voterAddress: string;
  comment: string;
  date: Date;
  pollId: number;
  network: SupportedNetworks;
};

export type PollsCommentsRequestBody = {
  voterAddress: string;
  comments: Partial<PollComment>[];
  messageToSign: string;
  signedMessage: string;
  txHash: string;
};
