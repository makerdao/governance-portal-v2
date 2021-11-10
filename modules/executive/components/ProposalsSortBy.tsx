import shallow from 'zustand/shallow';
import { MenuItem } from '@reach/menu-button';

import useUiFiltersStore from 'stores/uiFilters';
import FilterButton from 'modules/app/components/FilterButton';

export default function ProposalsSortBy(props): JSX.Element {
  const [executiveSortBy, setExecutiveSortBy] = useUiFiltersStore(
    state => [state.executiveSortBy, state.setExecutiveSortBy],
    shallow
  );

  return (
    <FilterButton
      name={() => `Sort by ${executiveSortBy !== 'Date Posted' ? executiveSortBy : 'date'}`}
      listVariant="menubuttons.default.list"
      {...props}
    >
      <MenuItem
        onSelect={() => setExecutiveSortBy('Date Posted')}
        sx={{
          variant: 'menubuttons.default.item',
          fontWeight: executiveSortBy === 'Date Posted' ? 'bold' : undefined
        }}
      >
        Date Posted
      </MenuItem>
      <MenuItem
        onSelect={() => setExecutiveSortBy('MKR Amount')}
        sx={{
          variant: 'menubuttons.default.item',
          fontWeight: executiveSortBy === 'MKR Amount' ? 'bold' : undefined
        }}
      >
        MKR Amount
      </MenuItem>
    </FilterButton>
  );
}
