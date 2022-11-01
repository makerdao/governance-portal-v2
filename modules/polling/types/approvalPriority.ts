import BigNumber from 'lib/bigNumberJs';

export type ApprovalPriorityOption = {
  mkrSupport: BigNumber;
  priorityScore: BigNumber;
  approvalPercentage: number;
  priorityScoreNumber: number;
};

export type ApprovalPriorityOptions = { [key: number]: ApprovalPriorityOption };

export type ApprovalPriorityResults = {
  rounds: number;
  winner: number | null;
  options: ApprovalPriorityOptions;
};
