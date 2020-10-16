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
      name={() => `Sort by ${commentSortBy !== 'Latest' ? commentSortBy : 'latest'}`}
      listVariant="menubuttons.default.list"
      {...props}
    >
      <MenuItem
        onSelect={() => setCommentSortBy('Latest')}
        sx={{
          variant: 'menubuttons.default.item',
          fontWeight: commentSortBy === 'Latest' ? 'bold' : null
        }}
      >
        Latest
      </MenuItem>
      <MenuItem
        onSelect={() => setCommentSortBy('Oldest')}
        sx={{
          variant: 'menubuttons.default.item',
          fontWeight: commentSortBy === 'Oldest' ? 'bold' : null
        }}
      >
        Oldest
      </MenuItem>
    </FilterButton>
  );
}
