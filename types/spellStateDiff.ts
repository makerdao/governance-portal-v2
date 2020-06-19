type ContractDiff = {
  [contractLabel: string]: {
    from: number | string;
    to: number | string;
    name: string;
    field: string | null;
    keys: string[] | null;
  }[];
};

type SpellStateDiff =
  | {
      hasBeenCast: true;
      executedOn: number;
      groupedDiff: ContractDiff;
    }
  | {
      hasBeenCast: false;
      executedOn: null;
      groupedDiff: ContractDiff;
    };

export default SpellStateDiff;
