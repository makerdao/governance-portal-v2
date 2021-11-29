export type VoteDelegateContract = {
  getVoteDelegateAddress: () => string;
  voteExec: (picks: string[] | string) => Promise<any>;
  votePoll: (pollIds: string[], pollOptions: string[]) => Promise<any>;
};
