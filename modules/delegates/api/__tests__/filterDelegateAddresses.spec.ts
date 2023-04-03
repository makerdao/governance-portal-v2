/*

SPDX-FileCopyrightText: © 2023 Dai Foundation <www.daifoundation.org>

SPDX-License-Identifier: AGPL-3.0-or-later

*/

import { filterDelegateAddresses } from 'modules/delegates/helpers/filterDelegates';
import { delegates } from '../mocks/delegates';

describe('Filter recognized delegate addresses', () => {
  it('filterDelegateAddresses returns an array', () => {
    const filteredDelegates = filterDelegateAddresses([], null, null);
    expect(filteredDelegates).toEqual([]);
  });

  it('filterDelegateAddresses returns a string array', () => {
    const filteredDelegates = filterDelegateAddresses(delegates, null, null);
    expect(filteredDelegates.every(delegate => typeof delegate === 'string')).toBe(true);
  });

  it('filterDelegateAddresses returns only recognized delegates', () => {
    const filteredDelegates = filterDelegateAddresses(delegates, null, null);
    expect(filteredDelegates).toHaveLength(7);
  });

  it('filterDelegateAddresses filters delegates by name', () => {
    const filteredDelegates = filterDelegateAddresses(delegates, null, 'floP Flap DeLegATe l');
    expect(filteredDelegates).toEqual([
      '0xaf8aa6846539033eaf0c3ca4c9c7373e370e039b',
      '0x0f4be9f208c552a6b04d9a1222f385785f95beaa'
    ]);
  });

  it('filterDelegateAddresses filters delegates by tags', () => {
    const filteredDelegates = filterDelegateAddresses(delegates, ['scalability', 'security'], null);
    expect(filteredDelegates).toEqual([
      '0x22d5294a23d49294bf11d9db8beda36e104ad9b3',
      '0xb0b829a6aae0f7e59b43391b2c8a1cfd0c801c8c'
    ]);
  });

  it('filterDelegateAddresses filters delegates by tags and name', () => {
    const filteredDelegates = filterDelegateAddresses(delegates, ['scalability'], 'llc');
    expect(filteredDelegates).toEqual([
      '0x845b36e1e4f41a361dd711bda8ea239bf191fe95',
      '0xaf8aa6846539033eaf0c3ca4c9c7373e370e039b',
      '0x0f4be9f208c552a6b04d9a1222f385785f95beaa'
    ]);
  });
});
