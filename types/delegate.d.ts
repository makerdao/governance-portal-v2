export type DelegateStatus = 'recognized' | 'expired' | 'shadow';

export type DelegateRepoInformation = {
  voteDelegateAddress: string;
  picture: string;
  name: string;
  externalUrl: string;
  description: string;
};

export type DelegateContractInformation = {
  address: string;
  voteDelegateAddress: string;
  blockTimestamp: Date;
};

export type Delegate = {
  id: string;
  name: string;
  address: string;
  voteDelegateAddress: string;
  description: string;
  picture: string;
  status: DelegateStatus;
  expired: boolean;
  lastVote: Date;
  expirationDate: Date;
  externalUrl?: string;
};
