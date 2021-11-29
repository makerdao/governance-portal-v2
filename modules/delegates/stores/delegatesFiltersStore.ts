import create from 'zustand';

type StoreDelegates = {
  filters: {
    lastVoted: null | Date;
    creationDate: null | Date;
    showUnrecognized: boolean;
    showRecognized: boolean;
  };
  sort: {
    random: boolean;
    lastVoted: boolean;
    mkrDelegated: boolean;
    creationDate: boolean;
  };
  setLastVotedFilter: (lastVoted: Date | null) => void;
  setCreationDateFilter: (creationDate: Date | null) => void;
  setShowUnrecognizedFilter: (showUnrecognized: boolean) => void;
  setShowRecognizedFilter: (showRecognized: boolean) => void;
  //   setRandomSort: (random: boolean) => void;
  //   setLastVotedSort: (lastVoted: boolean) => void;
  //   setMKRDelegatedSort: (mkrDelegated: boolean) => void;
  //   setCreationDateSort: (cretionDate: boolean) => void;

  resetFilters: () => void;
};

const [useDelegatesFiltersStore] = create<StoreDelegates>((set, get) => ({
  filters: {
    lastVoted: null,
    creationDate: null,
    showUnrecognized: true,
    showRecognized: true
  },
  sort: {
    random: true,
    lastVoted: false,
    mkrDelegated: false,
    creationDate: false
  },

  setLastVotedFilter: lastVoted => {
    set({
      filters: {
        ...get().filters,
        lastVoted
      }
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
        lastVoted: null,
        creationDate: null,
        showUnrecognized: true,
        showRecognized: true
      }
    });
  },

  resetSort: () => {
    set({
      sort: {
        random: true,
        lastVoted: false,
        mkrDelegated: false,
        creationDate: false
      }
    });
  }
}));

export default useDelegatesFiltersStore;
