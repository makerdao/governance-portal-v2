type LegacyPollVote = {
  pollId: number;
  optionId: number;
  optionIdRaw?: string;
  rankedChoiceOption?: number[];
  blockTimestamp: number;
};

type RankedChoicePollVote = {
  pollId: number;
  optionId?: number;
  optionIdRaw?: string;
  rankedChoiceOption: number[];
  blockTimestamp: number;
};

export type PollVote = LegacyPollVote | RankedChoicePollVote;
