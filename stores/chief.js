import create from 'zustand';

const [useChiefStore, chiefApi] = create((set, get) => ({
  hat: null,

  setHat: (address) => set({ hat: address }),
}));

export default useChiefStore;
export { chiefApi };
