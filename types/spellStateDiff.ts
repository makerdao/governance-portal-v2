type ContractDiff = {
  [contractLabel: string]: {
    from: number | string;
    to: number | string;
    name: string;
    keys: string[];
  }[];
};

type SpellStateDiff =
  | {
      hasBeenCast: true;
      executedAt: Date;
      groupedDiff: ContractDiff;
    }
  | {
      hasBeenCast: false;
      groupedDiff: ContractDiff;
    };

export default SpellStateDiff;
