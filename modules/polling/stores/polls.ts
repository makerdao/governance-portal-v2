/*

SPDX-FileCopyrightText: © 2023 Dai Foundation <www.daifoundation.org>

SPDX-License-Identifier: AGPL-3.0-or-later

*/

import create from 'zustand';
import { Poll } from '../types';

type Store = {
  filteredPolls: Poll[];

  setFilteredPolls: (polls: Poll[]) => void;
};

const [usePollsStore] = create<Store>((set, get) => ({
  filteredPolls: [],

  setFilteredPolls: filteredPolls => {
    set({ filteredPolls });
  }
}));

export default usePollsStore;
