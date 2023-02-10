/*

SPDX-FileCopyrightText: © 2023 Dai Foundation <www.daifoundation.org>

SPDX-License-Identifier: AGPL-3.0-or-later

*/

import { ApiError } from './ApiError';

type Options = {
  defaultValue: any;
  maxValue?: number;
  minValue?: number;
  validValues?: string[];
};

export default function validateQueryParam(
  value: any,
  type: 'number' | 'string' | 'date' | 'boolean' | 'array',
  options: Options,
  validationFunction = (val: any) => true,
  validationError = new ApiError('Invalid query parameter', 400)
): number | string | Date | boolean | string[] | null {
  const parsedValue = getParsedValue(value, type, options);

  const valid = validationFunction(parsedValue);

  if (!valid) {
    throw validationError;
  }

  return parsedValue;
}

// Returns the parsed value or the default value of a query parameter
function getParsedValue(
  value: any,
  type: 'number' | 'string' | 'date' | 'boolean' | 'array',
  options: Options
): number | string | Date | boolean | string[] | null {
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
    } else if (type === 'boolean') {
      if (typeof value !== 'string') {
        return options.defaultValue;
      }
      if (value.toLowerCase() === 'true') {
        return true;
      } else if (value.toLowerCase() === 'false') {
        return false;
      } else {
        return options.defaultValue;
      }
    } else if (type === 'array') {
      if (typeof value !== 'string') {
        return options.defaultValue;
      }
      const parsed = value.split(',');
      return parsed;
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
