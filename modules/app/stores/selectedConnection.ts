import create from 'zustand';
import { Connection } from 'modules/web3/connections';

type Store = {
  selectedConnection: Connection | null;

  setSelectedConnection: (connection: Connection) => void;
};

const [useSelectedConnectionStore] = create<Store>((set, get) => ({
  selectedConnection: null,

  setSelectedConnection: selectedConnection => {
    set({ selectedConnection });
  }
}));

export default useSelectedConnectionStore;
