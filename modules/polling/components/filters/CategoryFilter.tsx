/*

SPDX-FileCopyrightText: © 2023 Dai Foundation <www.daifoundation.org>

SPDX-License-Identifier: AGPL-3.0-or-later

*/

import { Flex, Box, Checkbox, Label, Text, ThemeUIStyleObject } from 'theme-ui';
import shallow from 'zustand/shallow';
import { Poll } from 'modules/polling/types';
import FilterButton from 'modules/app/components/FilterButton';
import useUiFiltersStore from 'modules/app/stores/uiFilters';
import { useMemo } from 'react';
import { filterPolls } from '../../helpers/filterPolls';
import { TagCount } from 'modules/app/types/tag';

export function CategoryFilter({
  tags,
  polls,
  ...props
}: {
  tags: TagCount[];
  polls: Poll[];
  sx?: ThemeUIStyleObject;
}): JSX.Element {
  const [pollFilters, categoryFilter, setCategoryFilter] = useUiFiltersStore(
    state => [state.pollFilters, state.pollFilters.categoryFilter, state.setCategoryFilter],
    shallow
  );

  const itemsSelected = Object.values(categoryFilter || {}).filter(i => !!i).length;

  const filteredPollsNoCategories = useMemo(() => {
    return filterPolls({
      polls,
      pollFilters
    });
  }, [polls, pollFilters]);

  return (
    <FilterButton
      name={() => `Tag ${itemsSelected > 0 ? `(${itemsSelected})` : ''}`}
      listVariant="cards.noPadding"
      data-testid="poll-filters-category"
      active={itemsSelected > 0}
      {...props}
    >
      <Box p={2} sx={{ maxHeight: '315px', overflowY: 'scroll' }}>
        <Flex sx={{ flexDirection: 'column' }}>
          {tags.map(tag => (
            <Flex key={tag.id}>
              <Label sx={{ py: 1, fontSize: 2, alignItems: 'center' }}>
                <Checkbox
                  sx={{ width: 3, height: 3 }}
                  checked={(categoryFilter && categoryFilter[tag.id]) || false}
                  onChange={event => {
                    setCategoryFilter({ ...categoryFilter, [tag.id]: event.target.checked });
                  }}
                />
                <Flex sx={{ justifyContent: 'space-between', width: '100%' }}>
                  <Text>{tag.longname ? tag.longname : tag.shortname}</Text>
                  <Text sx={{ color: 'secondaryEmphasis', ml: 3 }}>
                    {filteredPollsNoCategories.filter(i => i.tags.find(t => t.id === tag.id)).length}
                  </Text>
                </Flex>
              </Label>
            </Flex>
          ))}
        </Flex>
      </Box>
    </FilterButton>
  );
}
