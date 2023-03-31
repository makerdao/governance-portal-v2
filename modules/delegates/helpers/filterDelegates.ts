/*

SPDX-FileCopyrightText: © 2023 Dai Foundation <www.daifoundation.org>

SPDX-License-Identifier: AGPL-3.0-or-later

*/

import { DelegateStatusEnum } from '../delegates.constants';
import { Delegate } from '../types';

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
        const cvcArray = cvcs ? Object.keys(cvcs).filter(t => !!cvcs[t]) : [];
        if (cvcArray.length === 0) return true;
        if (cvcArray.length > 1) return false; //since no delegate can have more than 1 cvc
        return delegate.cvc_name && cvcArray.includes(delegate.cvc_name);
      })
  );
}
