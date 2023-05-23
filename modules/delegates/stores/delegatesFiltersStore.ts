/*

SPDX-FileCopyrightText: © 2023 Dai Foundation <www.daifoundation.org>

SPDX-License-Identifier: AGPL-3.0-or-later

*/

import { create } from 'zustand';
import { DelegateOrderByEnum, OrderDirectionEnum } from '../delegates.constants';

type StoreDelegates = {
  filters: {
    creationDate: null | Date;
    showShadow: boolean;
    showAligned: boolean;
    showExpired: boolean;
    name: string | null;
    avcs: string[];
  };
  sort: DelegateOrderByEnum;
  sortDirection: OrderDirectionEnum;
  setCreationDateFilter: (creationDate: Date | null) => void;
  setShowShadowFilter: (showShadow: boolean) => void;
  setShowAlignedFilter: (showAligned: boolean) => void;
  setShowExpiredFilter: (showExpired: boolean) => void;
  setSort: (sort: DelegateOrderByEnum) => void;
  setSortDirection: (sortDirection: OrderDirectionEnum) => void;
  setAvcFilter: (avc: string[]) => void;
  setName: (text: string) => void;
  resetFilters: () => void;
  resetSort: () => void;
  resetSortDirection: () => void;
  fetchOnLoad: boolean;
  setFetchOnLoad: (fetchOnLoad: boolean) => void;
};

const [useDelegatesFiltersStore] = create<StoreDelegates>((set, get) => ({
  filters: {
    creationDate: null,
    showShadow: true,
    showAligned: true,
    showExpired: false,
    name: null,
    avcs: []
  },
  sort: DelegateOrderByEnum.RANDOM,
  sortDirection: OrderDirectionEnum.DESC,
  fetchOnLoad: false,
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
  setSortDirection: sortDirection => {
    set({
      sortDirection
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

  setShowAlignedFilter: showAligned => {
    set({
      filters: {
        ...get().filters,
        showAligned
      }
    });
  },

  setAvcFilter: avcs => {
    set({
      filters: {
        ...get().filters,
        avcs
      }
    });
  },

  resetFilters: () => {
    set({
      filters: {
        name: null,
        creationDate: null,
        showShadow: true,
        showAligned: true,
        showExpired: false,
        avcs: []
      }
    });
  },

  resetSort: () => {
    set({
      sort: DelegateOrderByEnum.RANDOM
    });
  },

  resetSortDirection: () => {
    set({
      sortDirection: OrderDirectionEnum.DESC
    });
  },

  setFetchOnLoad: fetchOnLoad => {
    set({
      fetchOnLoad
    });
  }
}));

export default useDelegatesFiltersStore;
