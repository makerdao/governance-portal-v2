import { Flex, Box, Checkbox, Label, Text, ThemeUIStyleObject } from 'theme-ui';
import shallow from 'zustand/shallow';
import FilterButton from 'modules/app/components/FilterButton';
import { useMemo } from 'react';
import { TagCount } from 'modules/app/types/tag';
import { Delegate } from 'modules/delegates/types';
import useDelegatesFiltersStore from 'modules/delegates/stores/delegatesFiltersStore';
import { filterDelegates } from 'modules/delegates/helpers/filterDelegates';

export function DelegatesTagFilter({
  tags,
  delegates,
  ...props
}: {
  tags: TagCount[];
  delegates: Delegate[];
  sx?: ThemeUIStyleObject;
}): JSX.Element {
  const [delegateFilters, setTags, name] = useDelegatesFiltersStore(
    state => [state.filters, state.setTagFilter, state.filters.name],
    shallow
  );

  const itemsSelected = Object.values(delegateFilters.tags || {}).filter(i => !!i).length;

  const filteredDelegates = useMemo(() => {
    return filterDelegates(
      delegates,
      delegateFilters.showShadow,
      delegateFilters.showRecognized,
      delegateFilters.showExpired,
      name,
      delegateFilters.tags
    );
  }, [delegates, delegateFilters]);

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
                  <Text sx={{ color: 'secondaryEmphasis', ml: 3 }}>
                    {filteredDelegates.filter(i => i.tags.find(t => t.id === tag.id)).length}
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
