/*

SPDX-FileCopyrightText: © 2023 Dai Foundation <www.daifoundation.org>

SPDX-License-Identifier: AGPL-3.0-or-later

*/

import { Flex, Box, Checkbox, Label, Text, ThemeUIStyleObject } from 'theme-ui';
import shallow from 'zustand/shallow';
import FilterButton from 'modules/app/components/FilterButton';
import { TagCount } from 'modules/app/types/tag';
import useDelegatesFiltersStore from 'modules/delegates/stores/delegatesFiltersStore';

export function DelegatesTagFilter({
  tags,
  ...props
}: {
  tags: TagCount[];
  sx?: ThemeUIStyleObject;
}): JSX.Element {
  const [delegateFilters, setTags] = useDelegatesFiltersStore(
    state => [state.filters, state.setTagFilter, state.filters.name],
    shallow
  );

  const itemsSelected = Object.values(delegateFilters.tags || {}).filter(i => !!i).length;

  return (
    <FilterButton
      name={() => `Tag ${itemsSelected > 0 ? `(${itemsSelected})` : ''}`}
      listVariant="cards.noPadding"
      data-testid="delegates-filters-dropdown"
      active={itemsSelected > 0}
      {...props}
    >
      <Box p={2} sx={{ maxHeight: '300px', overflowY: 'scroll' }}>
        <Flex sx={{ flexDirection: 'column' }}>
          {tags.map(tag => (
            <Flex key={tag.id}>
              <Label variant="thinLabel" sx={{ py: 1, fontSize: 2, alignItems: 'center' }}>
                <Checkbox
                  sx={{ width: 3, height: 3 }}
                  checked={(delegateFilters.tags && delegateFilters.tags[tag.id]) || false}
                  onChange={event => {
                    setTags({ ...delegateFilters.tags, [tag.id]: event.target.checked });
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
