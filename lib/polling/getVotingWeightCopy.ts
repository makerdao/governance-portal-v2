export const getVotingWeightCopy = (isVotingDelegate: boolean): string =>
  isVotingDelegate
    ? 'Your voting weight is made up of the MKR delegated to your delegate contract.'
    : 'Your voting weight is made up of the MKR in your wallet, vote proxy, and voting contract. This amount is applied to all polls you vote on.';
