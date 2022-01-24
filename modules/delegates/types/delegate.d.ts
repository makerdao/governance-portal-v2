export type DelegateStatus = 'recognized' | 'expired' | 'shadow';

export type DelegateRepoInformation = {
  voteDelegateAddress: string;
  picture?: string;
  name: string;
  externalUrl: string;
  description: string;
  combinedParticipation?: string;
  pollParticipation?: string;
  executiveParticipation?: string;
  communication?: string;
};

export type DelegateContractInformation = {
  address: string;
  voteDelegateAddress: string;
  blockTimestamp: Date;
  mkrDelegated: string;
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
  lastVote: Date | null;
  expirationDate: Date;
  externalUrl?: string;
  combinedParticipation?: string;
  pollParticipation?: string;
  executiveParticipation?: string;
  communication?: string;
  mkrDelegated: string;
};

export type DelegationHistory = {
  address: string;
  lockAmount: string;
  events: DelegationHistoryEvent[];
};

export type DelegationHistoryEvent = {
  lockAmount: string;
  blockTimestamp: string;
  hash: string;
};
