/** @jsx jsx */
import { jsx } from 'theme-ui';
import shallow from 'zustand/shallow';
import { MenuItem } from '@reach/menu-button';

import useUiFiltersStore from '../../stores/uiFilters';
import FilterButton from '../FilterButton';

export default function (props): JSX.Element {
  const [commentSortBy, setCommentSortBy] = useUiFiltersStore(
    state => [state.commentSortBy, state.setCommentSortBy],
    shallow
  );

  return (
    <FilterButton
      name={() => `Sort by ${commentSortBy !== 'Date Posted' ? commentSortBy : ''}`}
      listVariant="menubuttons.default.list"
      {...props}
    >
      <MenuItem
        onSelect={() => setCommentSortBy('Date Posted')}
        sx={{
          variant: 'menubuttons.default.item',
          fontWeight: commentSortBy === 'Date Posted' ? 'bold' : null
        }}
      >
        Date Posted
      </MenuItem>
      <MenuItem
        onSelect={() => setCommentSortBy('MKR Amount')}
        sx={{
          variant: 'menubuttons.default.item',
          fontWeight: commentSortBy === 'MKR Amount' ? 'bold' : null
        }}
      >
        MKR Amount
      </MenuItem>
    </FilterButton>
  );
}
