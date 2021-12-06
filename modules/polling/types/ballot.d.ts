export type Ballot = {
  [pollId: number]: {
    option: number | number[];
    submitted?: number | number[];
  };
};
