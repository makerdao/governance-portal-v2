export type VoteProxyContract = {
  getProxyAddress: () => string;
  getColdAddress: () => string;
  getHotAddress: () => string;
  lock: (amount?: any) => Promise<any>;
  free: () => Promise<any>;
  voteExec: (picks: string[] | string) => Promise<any>;
  getNumDeposits: () => Promise<any>;
  getVotedProposalAddresses: () => Promise<any>;
};

export type OldVoteProxyContract = {
  role: string;
  address: string;
};
