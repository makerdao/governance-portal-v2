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
  blockTimestamp: string;
  mkrDelegated: string;
  proposalsSupported: number;
  mkrLockedDelegate: MKRLockedDelegateAPIResponse[];
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
  lastVoteDate: string | null;
  expirationDate: Date;
  externalUrl?: string;
  combinedParticipation?: string;
  pollParticipation?: string;
  executiveParticipation?: string;
  communication?: string;
  mkrDelegated: string;
  proposalsSupported: number;
  execSupported: CMSProposal | undefined;
  mkrLockedDelegate: MKRLockedDelegateAPIResponse[];
  blockTimestamp: string;
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



export type MKRLockedDelegateAPIResponse = {
  fromAddress: string;
  lockAmount: string;
  blockNumber: number;
  blockTimestamp: string;
  lockTotal: string;
  hash: string;
};

export type MKRDelegatedToDAIResponse = MKRLockedDelegateAPIResponse & {
  hash: string;
  immediateCaller: string;
};
