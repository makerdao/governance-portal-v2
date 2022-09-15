export type PollVote = {
  pollId: number;
  optionIdRaw?: string;
  ballot: number[];
  blockTimestamp: string;
};
