export type BallotVote = {
  option: number | number[];
  comment?: string;
};
export type Ballot = {
  [pollId: number]: BallotVote;
};
