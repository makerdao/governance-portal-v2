import { SupportedNetworks } from 'modules/web3/constants/networks';

export type ExecutiveComment = {
  voterAddress: string;
  hotAddress: string;

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
  comment: string;
  hotAddress: string;
  signedMessage: string;
  txHash: string;
  addressLockedMKR: string;
};
