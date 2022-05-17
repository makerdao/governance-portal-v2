import { PollVoteType } from 'modules/polling/types';
import create from 'zustand';

type Store = {
  pollFilters: {
    startDate: null | Date;
    endDate: null | Date;
    categoryFilter: null | { [category: string]: boolean };
    pollVoteType: null | PollVoteType;
    showHistorical: boolean;
    showPollActive: boolean;
    showPollEnded: boolean;
  };
  executiveFilters: {
    startDate: null | Date;
    endDate: null | Date;
  };
  setStartDate: (type: 'poll' | 'executive', startDate: Date | null) => void;
  setEndDate: (type: 'poll' | 'executive', endDate: Date | null) => void;
  setCategoryFilter: (categoryFilter: { [category: string]: boolean }) => void;
  setPollVoteType: (pollVoteType: PollVoteType) => void;
  setShowHistorical: (showHistorical: boolean) => void;
  setShowPollActive: (showActive: boolean) => void;
  setShowPollEnded: (ended: boolean) => void;
  resetPollFilters: () => void;
  resetExecutiveFilters: () => void;
  executiveSortBy: 'active' | 'date' | 'mkr';
  setExecutiveSortBy: (method: 'active' | 'date' | 'mkr') => void;
};

const [useUiFiltersStore] = create<Store>((set, get) => ({
  pollFilters: {
    startDate: null,
    endDate: null,
    categoryFilter: null,
    pollVoteType: null,
    showHistorical: false,
    showPollActive: false,
    showPollEnded: false
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

  setPollVoteType: pollVoteType => {
    set({ pollFilters: { ...get().pollFilters, pollVoteType } });
  },

  setShowPollActive: (active: boolean) => {
    set({ pollFilters: { ...get().pollFilters, showPollActive: active } });
  },

  setShowPollEnded: (ended: boolean) => {
    set({ pollFilters: { ...get().pollFilters, showPollEnded: ended } });
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
        pollVoteType: null,
        showHistorical: false,
        showPollActive: false,
        showPollEnded: false
      }
    });
  },

  resetExecutiveFilters: () => {
    set({
      executiveFilters: {
        startDate: null,
        endDate: null
      }
    });
  },

  executiveSortBy: 'active',

  setExecutiveSortBy: sortMethod => {
    set({ executiveSortBy: sortMethod });
  }
}));

export default useUiFiltersStore;
