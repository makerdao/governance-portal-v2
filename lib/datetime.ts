import { formatDistance } from 'date-fns';
import { format, utcToZonedTime } from 'date-fns-tz';

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