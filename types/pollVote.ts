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

type PollVote = LegacyPollVote | RankedChoicePollVote;

export default PollVote;
