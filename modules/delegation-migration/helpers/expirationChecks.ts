import { add, isAfter, isBefore } from 'date-fns';

const DAYS_TO_WARN_BEFORE = 30;

export const isAboutToExpireCheck = (expirationDate: Date): boolean =>
  isBefore(new Date(expirationDate), add(new Date(), { days: DAYS_TO_WARN_BEFORE }));

export const isExpiredCheck = (expirationDate: Date): boolean =>
  isAfter(new Date(), new Date(expirationDate));
