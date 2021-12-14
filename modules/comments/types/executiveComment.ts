import { SupportedNetworks } from 'lib/constants';

export type ExecutiveComment = {
  voterAddress: string;
  delegateAddress?: string;
  voterWeight: string;
  comment: string;
  date: Date;
  spellAddress: string;
  network: SupportedNetworks;
};

export type ExecutiveCommentFromDB = ExecutiveComment & {
  _id: string;
};
