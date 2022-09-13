type Options = {
  defaultValue: number | string | Date | null;
  maxValue?: number;
  minValue?: number;
  validValues?: string[];
};

export default function validateQueryParam(
  value: any,
  type: 'number' | 'string' | 'date',
  options: Options
): number | string | Date | null {
  try {
    if (type === 'number') {
      const parsed = parseInt(value, 10);

      // Returns default value if is nan
      if (isNaN(parsed)) {
        return options.defaultValue;
      }

      // returns min value if integer is lower
      if (typeof options.minValue !== 'undefined' && parsed < options.minValue) {
        return options.minValue;
      }

      // returns max value if integer is higher
      if (typeof options.maxValue !== 'undefined' && parsed > options.maxValue) {
        return options.maxValue;
      }

      return parsed;
    } else if (type === 'string') {
      // returns default value if not string
      if (typeof value !== 'string') {
        return options.defaultValue;
      }

      // if there's a list of valid values and the value is not on the list, return the default
      if (options.validValues && options.validValues.indexOf(value) === -1) {
        return options.defaultValue;
      }

      return value;
    } else {
      if (!value) {
        return options.defaultValue;
      }

      // If invalid date, return default value
      const timestamp = Date.parse(value);
      if (isNaN(timestamp)) {
        return options.defaultValue;
      }

      return new Date(value);
    }
  } catch (e) {
    return options.defaultValue;
  }
}
