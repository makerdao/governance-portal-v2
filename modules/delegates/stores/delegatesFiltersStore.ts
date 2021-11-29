import create from 'zustand';

export enum delegatesSortEnum {
  random = 'random',
  lastVoted = 'lastVoted',
  mkrDelegated = 'mkrDelegated',
  creationDate = 'creationDate'
}

type StoreDelegates = {
  filters: {
    creationDate: null | Date;
    showUnrecognized: boolean;
    showRecognized: boolean;
  };
  sort: delegatesSortEnum;
  setCreationDateFilter: (creationDate: Date | null) => void;
  setShowUnrecognizedFilter: (showUnrecognized: boolean) => void;
  setShowRecognizedFilter: (showRecognized: boolean) => void;
  setSort: (sort: delegatesSortEnum) => void;
  resetFilters: () => void;
};

const [useDelegatesFiltersStore] = create<StoreDelegates>((set, get) => ({
  filters: {
    creationDate: null,
    showUnrecognized: true,
    showRecognized: true
  },
  sort: delegatesSortEnum.random,

  setSort: sort => {
    set({
      sort
    });
  },
  setCreationDateFilter: creationDate => {
    set({
      filters: {
        ...get().filters,
        creationDate
      }
    });
  },
  setShowUnrecognizedFilter: showUnrecognized => {
    set({
      filters: {
        ...get().filters,
        showUnrecognized
      }
    });
  },

  setShowRecognizedFilter: showRecognized => {
    set({
      filters: {
        ...get().filters,
        showRecognized
      }
    });
  },

  resetFilters: () => {
    set({
      filters: {
        creationDate: null,
        showUnrecognized: true,
        showRecognized: true
      }
    });
  },

  resetSort: () => {
    set({
      sort: delegatesSortEnum.random
    });
  }
}));

export default useDelegatesFiltersStore;
