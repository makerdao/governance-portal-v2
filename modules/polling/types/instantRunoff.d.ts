import BigNumber from 'lib/bigNumberJs';

export type InstantRunoffOption = {
  mkrSupport: BigNumber;
  transfer: BigNumber;
  winner: boolean;
  eliminated: boolean;
};

type InstantRunoffOptions = { [key: number]: InstantRunoffOption };

export type InstantRunoffResults = {
  rounds: number;
  winner: number | null;
  options: InstantRunoffOptions;
};
