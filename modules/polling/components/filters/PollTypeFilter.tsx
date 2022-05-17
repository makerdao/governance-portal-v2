import { Flex, Box, Checkbox, Label, Text, ThemeUIStyleObject } from 'theme-ui';
import shallow from 'zustand/shallow';
import { Poll, PollCategory } from 'modules/polling/types';
import FilterButton from 'modules/app/components/FilterButton';
import useUiFiltersStore from 'modules/app/stores/uiFilters';
import { useMemo } from 'react';
import { filterPolls } from '../../helpers/filterPolls';
import { useAnalytics } from 'modules/app/client/analytics/useAnalytics';
import { ANALYTICS_PAGES } from 'modules/app/client/analytics/analytics.constants';
import { POLL_VOTE_TYPE } from 'modules/polling/polling.constants';

export function PollTypeFilter({
  categories,
  polls,
  ...props
}: {
  categories: PollCategory[];
  polls: Poll[];
  sx?: ThemeUIStyleObject;
}): JSX.Element {
  const { trackButtonClick } = useAnalytics(ANALYTICS_PAGES.POLLING);
  const [startDate, endDate, categoryFilter, pollVoteType, setPollVoteType, showPollActive, showPollEnded] =
    useUiFiltersStore(
      state => [
        state.pollFilters.startDate,
        state.pollFilters.endDate,
        state.pollFilters.categoryFilter,
        state.pollFilters.pollVoteType,
        state.setPollVoteType,
        state.pollFilters.showPollActive,
        state.pollFilters.showPollEnded
      ],
      shallow
    );

  const itemsSelected = Object.values(categoryFilter || {}).filter(i => !!i);

  const filteredPollsNoCategories = useMemo(() => {
    return filterPolls(polls, startDate, endDate, null, showPollActive, showPollEnded);
  }, [polls, startDate, endDate, showPollActive, showPollEnded]);

  const filtersSelected = itemsSelected.length + (showPollActive ? 1 : 0) + (showPollEnded ? 1 : 0);
  return (
    <FilterButton
      name={() => `Type ${filtersSelected > 0 ? `(${filtersSelected})` : ''}`}
      listVariant="cards.noPadding"
      data-testid="poll-filters-dropdown"
      {...props}
    >
      <Box p={2} sx={{ maxHeight: '300px', overflowY: 'scroll' }}>
        <Flex sx={{ flexDirection: 'column' }}>
          {Object.values(POLL_VOTE_TYPE).map(type => (
            <Flex key={type}>
              <Label sx={{ py: 1, fontSize: 2, alignItems: 'center' }}>
                <Checkbox
                  sx={{ width: 3, height: 3 }}
                  checked={(pollVoteType && pollVoteType[type]) || false}
                  onChange={event => {
                    setPollVoteType(type);
                    // trackButtonClick(
                    //   `${category.name}FilterToggle${event.target.checked ? 'Checked' : 'Unchecked'}`
                    // );
                  }}
                />
                <Flex sx={{ justifyContent: 'space-between', width: '100%' }}>
                  <Text>{type}</Text>
                  <Text sx={{ color: 'muted', ml: 3 }}>
                    {filteredPollsNoCategories.filter(i => i.categories.includes(type)).length}
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
