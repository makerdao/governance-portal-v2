import { formatDistance, format as formatDate } from 'date-fns';
import { format, utcToZonedTime } from 'date-fns-tz';

export const SECONDS_PER_YEAR = 365 * 24 * 60 * 60;

export const formatDateWithTime = (dateString: Date | undefined | number | string): string => {
  if (!dateString) return '';

  const date = new Date(dateString);
  const utcTime = utcToZonedTime(date, 'UTC');

  try {
    return format(utcTime, 'MMM dd yyyy HH:mm zz', { timeZone: 'UTC' });
  } catch (err) {
    return '--';
  }
};

export const formatDateWithoutTime = (dateString: Date | undefined | number | string): string => {
  if (!dateString) return '';

  const date = new Date(dateString);

  try {
    return format(date, 'MMM dd yyyy');
  } catch (err) {
    return '--';
  }
};

export const formatTimeAgo = (dateString: Date | undefined | number | string): string => {
  if (!dateString) return '';
  const date = new Date(dateString);
  try {
    return formatDistance(date, new Date(), { addSuffix: true });
  } catch (err) {
    return '--';
  }
};

export const isoDateConversion = isoDate => {
  if (isoDate) {
    const d = isoDate.split(/[-T:]/);
    return new Date(d[0], d[1] - 1, d[2], d[3], d[4]);
  } else {
    return isoDate;
  }
};

export const formatIsoDateConversion = date =>
  parseInt(
    formatDate(new Date(isoDateConversion(date)), 'D', {
      useAdditionalDayOfYearTokens: true
    })
  );
