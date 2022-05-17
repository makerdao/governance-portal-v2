import { Flex, Box, Checkbox, Label, Text } from 'theme-ui';
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
}): JSX.Element {
  const { trackButtonClick } = useAnalytics(ANALYTICS_PAGES.POLLING);
  const [startDate, endDate, categoryFilter, pollVoteType, setCategoryFilter, showPollActive, showPollEnded] =
    useUiFiltersStore(
      state => [
        state.pollFilters.startDate,
        state.pollFilters.endDate,
        state.pollFilters.categoryFilter,
        state.pollFilters.pollVoteType,
        state.setCategoryFilter,
        state.pollFilters.showPollActive,
        state.pollFilters.showPollEnded
      ],
      shallow
    );

  const itemsSelected = Object.values(categoryFilter || {}).filter(i => !!i);
  const filteredPollsNoCategories = useMemo(() => {
    return filterPolls(polls, startDate, endDate, null, pollVoteType, showPollActive, showPollEnded);
  }, [polls, startDate, endDate, showPollActive, showPollEnded]);

  const filtersSelected = itemsSelected.length + (showPollActive ? 1 : 0) + (showPollEnded ? 1 : 0);
  return (
    <FilterButton
      name={() => `Category ${filtersSelected > 0 ? `(${filtersSelected})` : ''}`}
      listVariant="cards.noPadding"
      data-testid="poll-filters-dropdown"
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
