import { format } from 'date-fns';

export const formatDateWithTime = (dateString: Date | undefined | number | string): string => {
  if (!dateString) return '';

  const date = new Date(dateString);

  try {
    return format(date, 'MMM dd yyyy HH:mm zz');
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
