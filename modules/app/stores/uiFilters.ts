import create from 'zustand';

type Store = {
  pollFilters: {
    startDate: null | Date;
    endDate: null | Date;
    categoryFilter: null | { [category: string]: boolean };
    showHistorical: boolean;
  };
  executiveFilters: {
    startDate: null | Date;
    endDate: null | Date;
  };
  setStartDate: (type: 'poll' | 'executive', startDate: Date | null) => void;
  setEndDate: (type: 'poll' | 'executive', endDate: Date | null) => void;
  setCategoryFilter: (categoryFilter: { [category: string]: boolean }) => void;
  setShowHistorical: (showHistorical: boolean) => void;
  resetPollFilters: () => void;
  executiveSortBy: 'Date Posted' | 'MKR Amount';
  setExecutiveSortBy: (method: 'Date Posted' | 'MKR Amount') => void;
  commentSortBy: 'Latest' | 'Oldest' | 'MKR Amount';
  setCommentSortBy: (address: 'Latest' | 'Oldest' | 'MKR Amount') => void;
};

const [useUiFiltersStore] = create<Store>((set, get) => ({
  pollFilters: {
    startDate: null,
    endDate: null,
    categoryFilter: null,
    showHistorical: false
  },

  executiveFilters: {
    startDate: null,
    endDate: null
  },

  setStartDate: (type, startDate) => {
    if (type === 'poll') set({ pollFilters: { ...get().pollFilters, startDate } });
    else if (type === 'executive') set({ executiveFilters: { ...get().executiveFilters, startDate } });
  },

  setEndDate: (type, endDate) => {
    if (type === 'poll') set({ pollFilters: { ...get().pollFilters, endDate } });
    else if (type === 'executive') set({ executiveFilters: { ...get().executiveFilters, endDate } });
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
  },

  executiveSortBy: 'Date Posted',

  setExecutiveSortBy: sortMethod => {
    set({ executiveSortBy: sortMethod });
  },

  commentSortBy: 'Latest',

  setCommentSortBy: (sortMethod: 'Latest' | 'Oldest' | 'MKR Amount') => {
    set({ commentSortBy: sortMethod });
  }
}));

export default useUiFiltersStore;
