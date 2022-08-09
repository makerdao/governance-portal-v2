export type PollVote = {
  pollId: number;
  optionId?: number;
  optionIdRaw?: string;
  ballot: number[];
  blockTimestamp: string;
};
