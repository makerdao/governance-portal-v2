/*

SPDX-FileCopyrightText: © 2023 Dai Foundation <www.daifoundation.org>

SPDX-License-Identifier: AGPL-3.0-or-later

*/

import { DelegateStatusEnum } from '../delegates.constants';
import { Delegate } from '../types';

export function filterDelegates(
  delegates: Delegate[],
  showShadow: boolean,
  showRecognized: boolean,
  showExpired: boolean,
  name: string | null,
  tags?: { [key: string]: boolean }
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

        // return all if show shadow and show recognized are both unchecked
        if (!showShadow && !showRecognized) {
          return true;
        }

        if (!showShadow && delegate.status === DelegateStatusEnum.shadow) {
          return false;
        }

        if (!showRecognized && delegate.status === DelegateStatusEnum.recognized) {
          return false;
        }

        return true;
      })
      // Filter by tags
      .filter(delegate => {
        const tagArray = tags ? Object.keys(tags).filter(t => !!tags[t]) : [];
        if (tagArray.length > 0) {
          return tagArray.reduce((prev, next) => {
            return prev && delegate.tags.filter(tag => tag.id === next).length > 0;
          }, true);
        }

        return true;
      })
  );
}
