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
    tags: { [key: string]: boolean };
    text: string | null;
  };
  sort: delegatesSortEnum;
  setCreationDateFilter: (creationDate: Date | null) => void;
  setShowShadowFilter: (showShadow: boolean) => void;
  setShowRecognizedFilter: (showRecognized: boolean) => void;
  setSort: (sort: delegatesSortEnum) => void;
  setTagFilter: (tag: { [key: string]: boolean }) => void;
  setTextFilter: (text: string) => void;
  resetFilters: () => void;
};

const [useDelegatesFiltersStore] = create<StoreDelegates>((set, get) => ({
  filters: {
    creationDate: null,
    showShadow: false,
    showRecognized: false,
    text: '',
    tags: {}
  },
  sort: delegatesSortEnum.random,

  setTextFilter: (text: string) => {
    set({
      filters: {
        ...get().filters,
        text
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
        text: null,
        creationDate: null,
        showShadow: false,
        showRecognized: false
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
