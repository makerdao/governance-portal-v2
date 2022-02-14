import { SupportedNetworks } from 'modules/web3/constants/networks';

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
  txHash: string;
};
