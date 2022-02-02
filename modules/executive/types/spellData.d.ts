import { BigNumber } from 'ethers';

export type SpellData = {
  hasBeenCast: boolean;
  hasBeenScheduled: boolean;
  eta?: Date;
  expiration?: Date;
  nextCastTime?: Date;
  datePassed?: Date;
  dateExecuted?: Date;
  mkrSupport?: BigNumber;
  executiveHash?: string;
  officeHours?: boolean;
};
