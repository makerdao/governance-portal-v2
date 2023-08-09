/*

SPDX-FileCopyrightText: © 2023 Dai Foundation <www.daifoundation.org>

SPDX-License-Identifier: AGPL-3.0-or-later

*/

import { create } from 'zustand';
import { AvcOrderByEnum } from '../avcs.constants';

type StoreAvcs = {
  filters: {
    name: string | null;
    sort: AvcOrderByEnum;
  };
  setName: (name: string) => void;
  setSort: (sort: AvcOrderByEnum) => void;
  resetFilters: () => void;
};

const [useAvcsFiltersStore] = create<StoreAvcs>((set, get) => ({
  filters: {
    name: null,
    sort: AvcOrderByEnum.RANDOM
  },

  setName: name => {
    set({
      filters: {
        ...get().filters,
        name
      }
    });
  },

  setSort: sort => {
    set({
      filters: {
        ...get().filters,
        sort
      }
    });
  },

  resetFilters: () => {
    set({
      filters: {
        name: null,
        sort: AvcOrderByEnum.RANDOM
      }
    });
  }
}));

export default useAvcsFiltersStore;
