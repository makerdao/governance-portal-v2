export type SpellData = {
  hasBeenCast: boolean;
  hasBeenScheduled: boolean;
  eta?: Date;
  expiration?: Date;
  nextCastTime: Date;
  datePassed?: Date;
  dateExecuted?: Date;
  mkrSupport: number;
  executiveHash?: string;
  officeHours?: boolean;
};
