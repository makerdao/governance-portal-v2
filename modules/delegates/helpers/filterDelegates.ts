/*

SPDX-FileCopyrightText: © 2023 Dai Foundation <www.daifoundation.org>

SPDX-License-Identifier: AGPL-3.0-or-later

*/

import { DelegateTypeEnum } from '../delegates.constants';
import { AllDelegatesEntryWithName } from '../types';

export function filterDelegates(
  allDelegatesWithNames: AllDelegatesEntryWithName[],
  queryAvcs: string[] | null,
  searchTerm: string | null,
  type?: DelegateTypeEnum
): {
  alignedDelegatesAddresses: string[];
  filteredDelegateAddresses: string[];
  filteredDelegateEntries: AllDelegatesEntryWithName[];
} {
  const alignedDelegatesAddresses = filterDelegateAddresses(allDelegatesWithNames, null, null);
  const filteredDelegateAddresses = filterDelegateAddresses(
    allDelegatesWithNames,
    queryAvcs,
    searchTerm,
    type
  );
  const filteredDelegateEntries =
    !searchTerm && !queryAvcs
      ? allDelegatesWithNames
      : allDelegatesWithNames.filter(delegate => filteredDelegateAddresses.includes(delegate.voteDelegate));

  return { alignedDelegatesAddresses, filteredDelegateAddresses, filteredDelegateEntries };
}

export function filterDelegateAddresses(
  allDelegatesWithNames: AllDelegatesEntryWithName[],
  queryCvcs: string[] | null,
  searchTerm: string | null,
  type?: DelegateTypeEnum
): string[] {
  const statusFiltered = allDelegatesWithNames.filter(delegate =>
    type === DelegateTypeEnum.ALL ? true : delegate.delegateType === (type || DelegateTypeEnum.CONSTITUTIONAL)
  );

  const filteredDelegates = statusFiltered.filter(
    delegate =>
      (searchTerm
        ? delegate.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          delegate.voteDelegate.toLowerCase().includes(searchTerm.toLowerCase())
        : true) &&
      (queryCvcs ? queryCvcs.find(c => c.toLowerCase() === delegate.cvc_name?.toLowerCase()) : true)
  );

  return filteredDelegates.map(delegate => delegate.voteDelegate.toLowerCase());
}
