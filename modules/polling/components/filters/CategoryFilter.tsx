/*

SPDX-FileCopyrightText: © 2023 Dai Foundation <www.daifoundation.org>

SPDX-License-Identifier: AGPL-3.0-or-later

*/

import { Flex, Box, Checkbox, Label, Text, ThemeUIStyleObject } from 'theme-ui';
import shallow from 'zustand/shallow';
import FilterButton from 'modules/app/components/FilterButton';
import useUiFiltersStore from 'modules/app/stores/uiFilters';
import { TagCount } from 'modules/app/types/tag';

export function CategoryFilter({
  tags,
  ...props
}: {
  tags: TagCount[];
  sx?: ThemeUIStyleObject;
}): JSX.Element {
  const [categoryFilter, setCategoryFilter] = useUiFiltersStore(
    state => [state.pollFilters.categoryFilter, state.setCategoryFilter],
    shallow
  );

  const itemsSelected = categoryFilter.length;

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
                  checked={categoryFilter.includes(tag.id)}
                  onChange={event => {
                    setCategoryFilter(
                      event.target.checked
                        ? [...categoryFilter, tag.id]
                        : categoryFilter.filter(c => c !== tag.id)
                    );
                  }}
                />
                <Flex sx={{ justifyContent: 'space-between', width: '100%' }}>
                  <Text>{tag.longname ? tag.longname : tag.shortname}</Text>
                  <Text sx={{ color: 'secondaryEmphasis', ml: 3 }}>{tag.count}</Text>
                </Flex>
              </Label>
            </Flex>
          ))}
        </Flex>
      </Box>
    </FilterButton>
  );
}
