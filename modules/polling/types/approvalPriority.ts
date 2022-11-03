import BigNumber from 'lib/bigNumberJs';

export type ApprovalPriorityOption = {
  mkrSupport: BigNumber;
  priorityScore: BigNumber;
  approvalPercentage: BigNumber;
  priorityScorePercentage: BigNumber;
};

export type ApprovalPriorityOptions = { [key: number]: ApprovalPriorityOption };

export type ApprovalPriorityResults = {
  winner: number | null;
  options: ApprovalPriorityOptions;
};
