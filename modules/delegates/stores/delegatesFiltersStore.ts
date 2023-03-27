/*

SPDX-FileCopyrightText: © 2023 Dai Foundation <www.daifoundation.org>

SPDX-License-Identifier: AGPL-3.0-or-later

*/

import create from 'zustand';

export enum delegatesSortEnum {
  random = 'random',
  mkrDelegated = 'mkrDelegated',
  creationDate = 'creationDate'
}

type StoreDelegates = {
  filters: {
    creationDate: null | Date;
    showShadow: boolean;
    showConstitutional: boolean;
    showExpired: boolean;
    name: string | null;
  };
  sort: delegatesSortEnum;
  setCreationDateFilter: (creationDate: Date | null) => void;
  setShowShadowFilter: (showShadow: boolean) => void;
  setShowConstitutionalFilter: (showConstitutional: boolean) => void;
  setShowExpiredFilter: (showExpired: boolean) => void;
  setSort: (sort: delegatesSortEnum) => void;
  setName: (text: string) => void;
  resetFilters: () => void;
};

const [useDelegatesFiltersStore] = create<StoreDelegates>((set, get) => ({
  filters: {
    creationDate: null,
    showShadow: false,
    showConstitutional: false,
    showExpired: false,
    name: null
  },
  sort: delegatesSortEnum.random,

  setName: (name: string) => {
    set({
      filters: {
        ...get().filters,
        name
      }
    });
  },

  setSort: sort => {
    set({
      sort
    });
  },
  setCreationDateFilter: creationDate => {
    set({
      filters: {
        ...get().filters,
        creationDate
      }
    });
  },
  setShowShadowFilter: showShadow => {
    set({
      filters: {
        ...get().filters,
        showShadow
      }
    });
  },

  setShowExpiredFilter: showExpired => {
    set({
      filters: {
        ...get().filters,
        showExpired
      }
    });
  },

  setShowConstitutionalFilter: showConstitutional => {
    set({
      filters: {
        ...get().filters,
        showConstitutional
      }
    });
  },

  resetFilters: () => {
    set({
      filters: {
        name: null,
        creationDate: null,
        showShadow: true,
        showConstitutional: true,
        showExpired: false
      }
    });
  },

  resetSort: () => {
    set({
      sort: delegatesSortEnum.random
    });
  }
}));

export default useDelegatesFiltersStore;
