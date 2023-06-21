/*

SPDX-FileCopyrightText: © 2023 Dai Foundation <www.daifoundation.org>

SPDX-License-Identifier: AGPL-3.0-or-later

*/

import { DelegateStatusEnum, DelegateTypeEnum } from '../delegates.constants';
import { AllDelegatesEntryWithName, DelegatePaginated } from '../types';

export function filterDelegates(
  delegates: DelegatePaginated[],
  showShadow: boolean,
  showAligned: boolean,
  showExpired: boolean,
  name: string | null,
  avcs?: { [key: string]: boolean }
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

        // return all if show shadow and show aligned are both unchecked
        if (!showShadow && !showAligned) {
          return true;
        }

        if (!showShadow && delegate.status === DelegateStatusEnum.shadow) {
          return false;
        }

        if (!showAligned && delegate.status === DelegateStatusEnum.aligned) {
          return false;
        }

        return true;
      })
      // Filter by tags
      .filter(delegate => {
        // CVS act as a OR filter
        if (!avcs) return true;

        const avcArray = Object.keys(avcs).filter(key => avcs[key]);
        if (avcArray.length === 0) {
          return true;
        }

        return delegate.avc_name && avcArray.includes(delegate.avc_name);
      })
  );
}

export function filterDelegateAddresses(
  allDelegatesWithNames: AllDelegatesEntryWithName[],
  queryAvcs: string[] | null,
  searchTerm: string | null
): string[] {
  const filteredDelegates =
    !queryAvcs && !searchTerm
      ? allDelegatesWithNames.filter(delegate => delegate.delegateType === DelegateTypeEnum.ALIGNED)
      : allDelegatesWithNames.filter(
          delegate =>
            (searchTerm
              ? delegate.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                delegate.voteDelegate.toLowerCase().includes(searchTerm.toLowerCase())
              : true) &&
            (queryAvcs ? queryAvcs.find(c => c.toLowerCase() === delegate.avc_name?.toLowerCase()) : true)
        );

  return filteredDelegates.map(delegate => delegate.voteDelegate.toLowerCase());
}
