import CurrencyObject from './currency';

type Option = {
  firstChoice: CurrencyObject;
  transfer: CurrencyObject;
  winner: boolean;
  eliminated: boolean;
};

type PollTally = {
  winner: string | null;
  winningOption: string;
  rounds: number;
  totalMkrParticipation: CurrencyObject;
  options: { [key: string]: Option };
};

export default PollTally;
