export const getExecutiveVotingWeightCopy = (isVotingDelegate: boolean): string =>
  isVotingDelegate
    ? 'Your executive voting weight is made up of the MKR delegated to your delegate contract. This amount is applied to any executives you support.'
    : 'Your executive voting weight is made up of the MKR in your vote proxy and voting contract. This amount is applied to any executives you support.';
