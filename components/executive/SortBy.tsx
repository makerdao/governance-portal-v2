/** @jsx jsx */
import { Flex, Text, jsx } from 'theme-ui';
import shallow from 'zustand/shallow';
import { MenuItem } from '@reach/menu-button';

import useUiFiltersStore from '../../stores/uiFilters';
import FilterButton from '../FilterButton';

export default function (props): JSX.Element {
  const [executiveSortBy, setExecutiveSortBy] = useUiFiltersStore(
    state => [state.executiveSortBy, state.setExecutiveSortBy],
    shallow
  );

  return (
    <FilterButton name={() => `Sort by ${executiveSortBy}`} {...props}>
      <MenuItem
        onSelect={() => setExecutiveSortBy('Date Posted')}
        sx={{ mb: 3, fontSize: 4, fontWeight: executiveSortBy === 'Date Posted' ? 'bold' : null }}
      >
        Date Posted
      </MenuItem>
      <MenuItem
        onSelect={() => setExecutiveSortBy('MKR Amount')}
        sx={{ fontSize: 4, fontWeight: executiveSortBy === 'MKR Amount' ? 'bold' : null }}
      >
        MKR Amount
      </MenuItem>
    </FilterButton>
  );
}
