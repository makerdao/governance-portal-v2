export type DelegateStatus = 'active' | 'expired' | 'unrecognized';

export type DelegateRepoInformation = {
  voteDelegateAddress: string;
  picture: string;
  name: string;
  externalUrl: string;
  description: string;
};

export type DelegateContractInformation = {
  delegateAddress: string;
  voteDelegateAddress: string;
  expirationDate: Date;
};

export type Delegate = {
  id: string;
  name: string;
  delegateAddress: string;
  voteDelegateAddress: string;
  description: string;
  picture: string;
  status: DelegateStatus;
  expired: boolean;
  lastVote: Date;
  expirationDate: Date;
};
