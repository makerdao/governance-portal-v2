/*

SPDX-FileCopyrightText: © 2023 Dai Foundation <www.daifoundation.org>

SPDX-License-Identifier: AGPL-3.0-or-later

*/

import { DelegateTypeEnum } from '../delegates.constants';
import { AllDelegatesEntryWithName } from '../types';

export function filterDelegates(
  allDelegatesWithNames: AllDelegatesEntryWithName[],
  searchTerm: string | null,
  type?: DelegateTypeEnum
): {
  alignedDelegatesAddresses: string[];
  filteredDelegateAddresses: string[];
  filteredDelegateEntries: AllDelegatesEntryWithName[];
} {
  const alignedDelegatesAddresses = filterDelegateAddresses(allDelegatesWithNames, null);
  const filteredDelegateAddresses = filterDelegateAddresses(
    allDelegatesWithNames,
    searchTerm,
    type
  );
  const filteredDelegateEntries =
    !searchTerm
      ? allDelegatesWithNames
      : allDelegatesWithNames.filter(delegate => filteredDelegateAddresses.includes(delegate.voteDelegate));

  return { alignedDelegatesAddresses, filteredDelegateAddresses, filteredDelegateEntries };
}

export function filterDelegateAddresses(
  allDelegatesWithNames: AllDelegatesEntryWithName[],
  searchTerm: string | null,
  type?: DelegateTypeEnum
): string[] {
  const statusFiltered = allDelegatesWithNames.filter(delegate =>
    type === DelegateTypeEnum.ALL ? true : delegate.delegateType === (type || DelegateTypeEnum.ALIGNED)
  );

  const filteredDelegates = statusFiltered.filter(
    delegate =>
      (searchTerm
        ? delegate.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          delegate.voteDelegate.toLowerCase().includes(searchTerm.toLowerCase())
        : true)
  );

  return filteredDelegates.map(delegate => delegate.voteDelegate.toLowerCase());
}
