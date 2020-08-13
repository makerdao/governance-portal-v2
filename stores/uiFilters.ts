import create from 'zustand';

type Store = {
  pollFilters: {
    startDate: null | Date;
    endDate: null | Date;
    categories: null | { [category: string]: boolean };
  };
};

const [useUiFiltersStore] = create<Store>((set, get) => ({
  pollFilters: {
    startDate: null,
    endDate: null,
    categories: null
  },

  setStartDate: startDate => {
    set({ pollFilters: { ...get().pollFilters, startDate } });
  },

  setEndDate: endDate => {
    set({ pollFilters: { ...get().pollFilters, endDate } });
  },

  setCategoryFilter: categories => {
    set({ pollFilters: { ...get().pollFilters, categories } });
  }
}));

export default useUiFiltersStore;
