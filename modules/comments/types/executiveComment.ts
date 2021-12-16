import { SupportedNetworks } from 'lib/constants';

export type ExecutiveComment = {
  voterAddress: string;
  delegateAddress?: string;
  voteProxyAddress?: string;
  voterWeight: string;
  comment: string;
  date: Date;
  spellAddress: string;
  network: SupportedNetworks;
  txHash?: string;
};

export type ExecutiveCommentFromDB = ExecutiveComment & {
  _id: string;
};

export type ExecutiveCommentsRequestBody = {
  voterAddress: string;
  delegateAddress?: string;
  voteProxyAddress?: string;
  comment: string;
  signedMessage: string;
  voterWeight: string;
  txHash: string;
};
