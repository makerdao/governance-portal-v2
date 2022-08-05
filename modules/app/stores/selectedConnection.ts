import create from 'zustand';
import { ConnectionType } from 'modules/web3/connections';

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
