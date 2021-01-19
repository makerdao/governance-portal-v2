type SpellData = {
  hasBeenCast: boolean;
  hasBeenScheduled: boolean;
  eta?: Date;
  datePassed?: Date;
  dateExecuted?: Date;
  mkrSupport: number;
};

export default SpellData;
