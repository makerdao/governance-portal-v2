export type BallotVote = {
  option: number | number[];
  comment?: string;
  transactionHash?: string;
  timestamp: number;
};
export type Ballot = {
  [pollId: number]: BallotVote;
};
