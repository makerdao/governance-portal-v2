type LegacyPollVote = {
  pollId: number;
  optionId: number;
  optionIdRaw?: string;
  rankedChoiceOption?: number[];
  blockTimestamp: string;
};

type RankedChoicePollVote = {
  pollId: number;
  optionId?: number;
  optionIdRaw?: string;
  rankedChoiceOption: number[];
  blockTimestamp: string;
};

export type PollVote = LegacyPollVote | RankedChoicePollVote;
