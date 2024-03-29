/*

SPDX-FileCopyrightText: © 2023 Dai Foundation <www.daifoundation.org>

SPDX-License-Identifier: AGPL-3.0-or-later

*/

/* eslint-disable */

import { ApiError } from '../ApiError';
import validateQueryParam from '../validateQueryParam';

describe('Validate query parameters', () => {
  it('returns default value for a invalid integer', () => {
    const result = validateQueryParam('asdad', 'number', {
      defaultValue: 3
    });

    expect(result).toEqual(3);
  });

  it('returns the min value if the number is less than the minimum', () => {
    const result = validateQueryParam(-3, 'number', {
      minValue: 0,
      defaultValue: 3
    });
    expect(result).toEqual(0);
  });

  it('returns the max value if the number is more than the maximum', () => {
    const result = validateQueryParam(30, 'number', {
      maxValue: 10,
      defaultValue: 3
    });
    expect(result).toEqual(10);
  });

  it('returns the default value if value is not a string', () => {
    const result = validateQueryParam(21312, 'string', {
      defaultValue: 'date'
    });
    expect(result).toEqual('date');
  });

  it('returns the default value if the string is not on the valid list', () => {
    const result = validateQueryParam('monkey', 'string', {
      validValues: ['date', 'time', 'title'],
      defaultValue: 'date'
    });
    expect(result).toEqual('date');
  });

  it('returns the query value if the string is on the valid list', () => {
    const result = validateQueryParam('monkey', 'string', {
      validValues: ['date', 'monkey', 'title'],
      defaultValue: 'date'
    });
    expect(result).toEqual('monkey');
  });

  it('returns the default date if no date is provided', () => {
    const date = new Date();
    const result = validateQueryParam(0, 'date', {
      defaultValue: date
    });
    expect(result).toEqual(date);
  });

  it('returns the parsed date if is provided', () => {
    const date = new Date('Tue Sep 13 2022 10:47:14');

    const result = validateQueryParam('Tue Sep 13 2022 10:47:14', 'date', {
      defaultValue: new Date()
    });
    expect(result).toEqual(date);
  });

  it('returns the default value if date is invalid', () => {
    const date = new Date();

    const result = validateQueryParam('asdasdasdsa', 'date', {
      defaultValue: date
    });
    expect(result).toEqual(date);
  });

  it('Throws specific error if validation function fails', () => {
    const error = new ApiError('test');
    const validationFunction = () => {
      return false;
    };

    expect(() => {
      validateQueryParam(
        'asdasdasdsa',
        'date',
        {
          defaultValue: new Date()
        },
        validationFunction,
        error
      );
    }).toThrow(error);
  });

  it('Throws default error if validation function fails', () => {
    const validationFunction = () => {
      return false;
    };

    expect(() => {
      validateQueryParam(
        'asdasdasdsa',
        'date',
        {
          defaultValue: new Date()
        },
        validationFunction
      );
    }).toThrow(new ApiError('Invalid query parameter', 400));
  });

  it('Does not throw error if validation function passes', () => {
    const validationFunction = () => {
      return true;
    };

    expect(() => {
      validateQueryParam(
        'asdasdasdsa',
        'date',
        {
          defaultValue: new Date()
        },
        validationFunction
      );
    }).not.toThrow();
  });
});
