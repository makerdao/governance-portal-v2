import create from 'zustand';

type Store = {
  pollFilters: {
    startDate: null | Date;
    endDate: null | Date;
    categoryFilter: null | { [category: string]: boolean };
    showHistorical: boolean;
  };
  setStartDate: (startDate: Date | null) => void;
  setEndDate: (endDate: Date | null) => void;
  setCategoryFilter: (categoryFilter: { [category: string]: boolean }) => void;
  setShowHistorical: (showHistorical: boolean) => void;
  resetPollFilters: () => void;
};

const [useUiFiltersStore] = create<Store>((set, get) => ({
  pollFilters: {
    startDate: null,
    endDate: null,
    categoryFilter: null,
    showHistorical: false
  },

  setStartDate: startDate => {
    set({ pollFilters: { ...get().pollFilters, startDate } });
  },

  setEndDate: endDate => {
    set({ pollFilters: { ...get().pollFilters, endDate } });
  },

  setCategoryFilter: categoryFilter => {
    set({ pollFilters: { ...get().pollFilters, categoryFilter } });
  },

  setShowHistorical: showHistorical => {
    set({ pollFilters: { ...get().pollFilters, showHistorical } });
  },

  resetPollFilters: () => {
    set({
      pollFilters: {
        startDate: null,
        endDate: null,
        categoryFilter: null,
        showHistorical: false
      }
    });
  }
}));

export default useUiFiltersStore;
