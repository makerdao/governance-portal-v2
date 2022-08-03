import create from 'zustand';

export enum delegatesSortEnum {
  random = 'random',
  mkrDelegated = 'mkrDelegated',
  creationDate = 'creationDate'
}

type StoreDelegates = {
  filters: {
    creationDate: null | Date;
    showShadow: boolean;
    showRecognized: boolean;
    showExpired: boolean;
    name: string | null;
    tags: { [key: string]: boolean };
  };
  sort: delegatesSortEnum;
  setCreationDateFilter: (creationDate: Date | null) => void;
  setShowShadowFilter: (showShadow: boolean) => void;
  setShowRecognizedFilter: (showRecognized: boolean) => void;
  setShowExpiredFilter: (showExpired: boolean) => void;
  setSort: (sort: delegatesSortEnum) => void;
  setTagFilter: (tag: { [key: string]: boolean }) => void;
  setName: (text: string) => void;
  resetFilters: () => void;
};

const [useDelegatesFiltersStore] = create<StoreDelegates>((set, get) => ({
  filters: {
    creationDate: null,
    showShadow: false,
    showRecognized: false,
    showExpired: false,
    name: null,
    tags: {}
  },
  sort: delegatesSortEnum.random,

  setName: (name: string) => {
    set({
      filters: {
        ...get().filters,
        name
      }
    });
  },

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
  setShowShadowFilter: showShadow => {
    set({
      filters: {
        ...get().filters,
        showShadow
      }
    });
  },

  setShowExpiredFilter: showExpired => {
    set({
      filters: {
        ...get().filters,
        showExpired
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

  setTagFilter: tags => {
    set({
      filters: {
        ...get().filters,
        tags
      }
    });
  },

  resetFilters: () => {
    set({
      filters: {
        tags: {},
        name: null,
        creationDate: null,
        showShadow: true,
        showRecognized: true,
        showExpired: false
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
