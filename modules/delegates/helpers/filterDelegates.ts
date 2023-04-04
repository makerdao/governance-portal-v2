/*

SPDX-FileCopyrightText: © 2023 Dai Foundation <www.daifoundation.org>

SPDX-License-Identifier: AGPL-3.0-or-later

*/

import { DelegateStatusEnum, DelegateTypeEnum } from '../delegates.constants';
import { AllDelegatesEntryWithName, Delegate } from '../types';

export function filterDelegates(
  delegates: Delegate[],
  showShadow: boolean,
  showConstitutional: boolean,
  showExpired: boolean,
  name: string | null,
  cvcs?: { [key: string]: boolean }
): Delegate[] {
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
  name: string | null
): string[] {
  const filteredDelegates =
    !queryCvcs && !name
      ? allDelegatesWithNames.filter(delegate => delegate.delegateType === DelegateTypeEnum.CONSTITUTIONAL)
      : allDelegatesWithNames.filter(
          delegate =>
            (name ? delegate.name?.toLowerCase().includes(name.toLowerCase()) : true) &&
            (queryCvcs ? queryCvcs.includes(delegate.cvc_name || '') : true)
        );

  return filteredDelegates.map(delegate => delegate.voteDelegate.toLowerCase());
}
