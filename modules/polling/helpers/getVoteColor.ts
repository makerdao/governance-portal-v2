import { PollParameters } from '../types';
import { isInputFormatChooseFree, isInputFormatRankFree } from './utils';

export const getVoteColor = (optionId: number, pollParameters: PollParameters, text = true): string => {
  const abstainOption = '#708390';
  const noOption = '#F75524';
  const yesOption = '#1AAB9B';

  if (pollParameters.inputFormat.abstain.indexOf(optionId) !== -1) {
    return abstainOption;
  }

  if (isInputFormatRankFree(pollParameters)) {
    if (text) return 'text';
    return abstainOption;
  }

  if (isInputFormatChooseFree(pollParameters)) {
    return pollParameters.inputFormat.options.indexOf(optionId) !== -1 ? yesOption : noOption;
  }

  const colors = {
    0: abstainOption,
    1: yesOption,
    2: noOption
  };

  return colors[optionId];
};
