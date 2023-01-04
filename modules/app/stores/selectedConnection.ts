/*

SPDX-FileCopyrightText: © 2023 Dai Foundation <www.daifoundation.org>

SPDX-License-Identifier: AGPL-3.0-or-later

*/

import create from 'zustand';
import { ConnectionType } from 'modules/web3/constants/wallets';

type Store = {
  selectedConnection: ConnectionType | null;

  setSelectedConnection: (connection: ConnectionType) => void;
};

const [useSelectedConnectionStore] = create<Store>((set, get) => ({
  selectedConnection: null,

  setSelectedConnection: selectedConnection => {
    set({ selectedConnection });
  }
}));

export default useSelectedConnectionStore;
