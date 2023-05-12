/*

SPDX-FileCopyrightText: © 2023 Dai Foundation <www.daifoundation.org>

SPDX-License-Identifier: AGPL-3.0-or-later

*/

import { DelegateStatusEnum, DelegateTypeEnum } from '../delegates.constants';
import { AllDelegatesEntryWithName, DelegatePaginated } from '../types';

export function filterDelegates(
  delegates: DelegatePaginated[],
  showShadow: boolean,
  showConstitutional: boolean,
  showExpired: boolean,
  name: string | null,
  cvcs?: { [key: string]: boolean }
): DelegatePaginated[] {
  return (
    delegates
      // name filter
      .filter(delegate => {
        if (!name || name.trim() === '') return true;

        return delegate.name.toLowerCase().includes(name.toLowerCase());
      })
      .filter(delegate => {
        // filter out expired if show expired not checked
        if (!showExpired && delegate.expired === true) {
          return false;
        }

        // return all if show shadow and show constitutional are both unchecked
        if (!showShadow && !showConstitutional) {
          return true;
        }

        if (!showShadow && delegate.status === DelegateStatusEnum.shadow) {
          return false;
        }

        if (!showConstitutional && delegate.status === DelegateStatusEnum.constitutional) {
          return false;
        }

        return true;
      })
      // Filter by tags
      .filter(delegate => {
        // CVS act as a OR filter
        if (!cvcs) return true;

        const cvcArray = Object.keys(cvcs).filter(key => cvcs[key]);
        if (cvcArray.length === 0) {
          return true;
        }

        return delegate.cvc_name && cvcArray.includes(delegate.cvc_name);
      })
  );
}

export function filterDelegateAddresses(
  allDelegatesWithNames: AllDelegatesEntryWithName[],
  queryCvcs: string[] | null,
  searchTerm: string | null,
  shadow = false
): string[] {
  const statusFiltered = allDelegatesWithNames.filter(
    delegate => delegate.delegateType === (shadow ? DelegateTypeEnum.SHADOW : DelegateTypeEnum.CONSTITUTIONAL)
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
