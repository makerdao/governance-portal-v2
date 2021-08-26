type LegacyPollVote = {
  pollId: number;
  option: number;
  rankedChoiceOption?: number[];
  blockTimestamp: number;
};

type RankedChoicePollVote = {
  pollId: number;
  option?: number;
  rankedChoiceOption: number[];
  blockTimestamp: number;
};

export type PollVote = LegacyPollVote | RankedChoicePollVote;
