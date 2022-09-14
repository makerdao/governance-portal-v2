export type BallotVote = {
  option: number | number[];
  comment?: string;
  transactionHash?: string;
};
export type Ballot = {
  [pollId: number]: BallotVote;
};
