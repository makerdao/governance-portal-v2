import { Flex, Box, Checkbox, Label, Text, ThemeUIStyleObject } from 'theme-ui';
import shallow from 'zustand/shallow';
import { Poll, PollCategory } from 'modules/polling/types';
import FilterButton from 'modules/app/components/FilterButton';
import useUiFiltersStore from 'modules/app/stores/uiFilters';
import { useMemo } from 'react';
import { filterPolls } from '../../helpers/filterPolls';
import { useAnalytics } from 'modules/app/client/analytics/useAnalytics';
import { ANALYTICS_PAGES } from 'modules/app/client/analytics/analytics.constants';

export function CategoryFilter({
  categories,
  polls,
  ...props
}: {
  categories: PollCategory[];
  polls: Poll[];
  sx?: ThemeUIStyleObject;
}): JSX.Element {
  const { trackButtonClick } = useAnalytics(ANALYTICS_PAGES.POLLING);
  const [pollFilters, categoryFilter, setCategoryFilter] = useUiFiltersStore(
    state => [state.pollFilters, state.pollFilters.categoryFilter, state.setCategoryFilter],
    shallow
  );

  const itemsSelected = Object.values(categoryFilter || {}).filter(i => !!i).length;

  const filteredPollsNoCategories = useMemo(() => {
    return filterPolls({
      polls,
      pollFilters: {
        ...pollFilters,
        categoryFilter: null
      }
    });
  }, [polls, pollFilters]);

  return (
    <FilterButton
      name={() => `Category ${itemsSelected > 0 ? `(${itemsSelected})` : ''}`}
      listVariant="cards.noPadding"
      data-testid="poll-filters-dropdown"
      active={itemsSelected > 0}
      {...props}
    >
      <Box p={2} sx={{ maxHeight: '300px', overflowY: 'scroll' }}>
        <Flex sx={{ flexDirection: 'column' }}>
          {categories.map(category => (
            <Flex key={category.name}>
              <Label sx={{ py: 1, fontSize: 2, alignItems: 'center' }}>
                <Checkbox
                  sx={{ width: 3, height: 3 }}
                  checked={(categoryFilter && categoryFilter[category.name]) || false}
                  onChange={event => {
                    setCategoryFilter({ ...categoryFilter, [category.name]: event.target.checked });
                    trackButtonClick(
                      `${category.name}FilterToggle${event.target.checked ? 'Checked' : 'Unchecked'}`
                    );
                  }}
                />
                <Flex sx={{ justifyContent: 'space-between', width: '100%' }}>
                  <Text>{category.name}</Text>
                  <Text sx={{ color: 'muted', ml: 3 }}>
                    {filteredPollsNoCategories.filter(i => i.categories.includes(category.name)).length}
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
