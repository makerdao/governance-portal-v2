type LegacyPollVote = {
  pollId: number;
  option: number;
  rankedChoiceOption?: number[];
};

type RankedChoicePollVote = {
  pollId: number;
  option?: number;
  rankedChoiceOption: number[];
};

export type PollVote = LegacyPollVote | RankedChoicePollVote;
