/*

SPDX-FileCopyrightText: © 2023 Dai Foundation <www.daifoundation.org>

SPDX-License-Identifier: AGPL-3.0-or-later

*/

import { parsePollOptions } from '../parsePollOptions';

describe('parsePollOptions', () => {
  it('correctly parses poll options', () => {
    // first RC poll, second is plurality
    const pollOptions = [[7, 9, 11], 0];
    const results = parsePollOptions(pollOptions);

    expect(results).toEqual(['723207', 0]);
  });
});
