/*

SPDX-FileCopyrightText: © 2023 Dai Foundation <www.daifoundation.org>

SPDX-License-Identifier: AGPL-3.0-or-later

*/

import { isValidEmail } from '../email';

describe('Email validator', () => {
  it('Should validate a correct email', () => {
    const valid = isValidEmail('aaa@asd.com');
    expect(valid).toBe(true);
  });

  it('Should say is not valid', () => {
    const valid = isValidEmail('foot');
    expect(valid).toBe(false);
  });
});
