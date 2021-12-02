import shallow from 'zustand/shallow';
import { MenuItem } from '@reach/menu-button';

import useUiFiltersStore from 'modules/app/stores/uiFilters';
import FilterButton from 'modules/app/components/FilterButton';

export default function CommentSortBy(props): JSX.Element {
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
          fontWeight: commentSortBy === 'Latest' ? 'bold' : undefined
        }}
      >
        Latest
      </MenuItem>
      <MenuItem
        onSelect={() => setCommentSortBy('Oldest')}
        sx={{
          variant: 'menubuttons.default.item',
          fontWeight: commentSortBy === 'Oldest' ? 'bold' : undefined
        }}
      >
        Oldest
      </MenuItem>
      <MenuItem
        onSelect={() => setCommentSortBy('MKR Amount')}
        sx={{
          variant: 'menubuttons.default.item',
          fontWeight: commentSortBy === 'MKR Amount' ? 'bold' : undefined
        }}
      >
        MKR Amount
      </MenuItem>
    </FilterButton>
  );
}
