import { Flex, Box, Checkbox, Label, Text, Divider } from 'theme-ui';
import shallow from 'zustand/shallow';
import { Poll } from 'modules/polling/types';
import FilterButton from 'modules/app/components/FilterButton';
import useUiFiltersStore from 'modules/app/stores/uiFilters';
import { isActivePoll } from 'modules/polling/helpers/utils';
import { useMemo } from 'react';
import { filterPolls } from '../helpers/filterPolls';
import { useAnalytics } from 'modules/app/client/analytics/useAnalytics';
import { ANALYTICS_PAGES } from 'modules/app/client/analytics/analytics.constants';
import { Tag } from 'modules/app/types/tag.dt';

export default function CategoryFilter({
  tags,
  polls,
  ...props
}: {
  tags: Tag[];
  polls: Poll[];
}): JSX.Element {
  const { trackButtonClick } = useAnalytics(ANALYTICS_PAGES.POLLING);
  const [
    startDate,
    endDate,
    categoryFilter,
    setCategoryFilter,
    showPollActive,
    showPollEnded,
    setShowPollActive,
    setShowPollEnded
  ] = useUiFiltersStore(
    state => [
      state.pollFilters.startDate,
      state.pollFilters.endDate,
      state.pollFilters.categoryFilter,
      state.setCategoryFilter,
      state.pollFilters.showPollActive,
      state.pollFilters.showPollEnded,
      state.setShowPollActive,
      state.setShowPollEnded
    ],
    shallow
  );
  const itemsSelected = Object.values(categoryFilter || {}).filter(i => !!i);
  const filteredPollsOnlyCategories = useMemo(() => {
    return filterPolls(polls, startDate, endDate, categoryFilter, true, true);
  }, [polls, startDate, endDate, categoryFilter]);

  const filteredPollsNoCategories = useMemo(() => {
    return filterPolls(polls, startDate, endDate, null, showPollActive, showPollEnded);
  }, [polls, startDate, endDate, showPollActive, showPollEnded]);

  const filteredPolls = useMemo(() => {
    return filterPolls(polls, startDate, endDate, categoryFilter, showPollActive, showPollEnded);
  }, [polls, startDate, endDate, categoryFilter, showPollActive, showPollEnded]);

  const filtersSelected = itemsSelected.length + (showPollActive ? 1 : 0) + (showPollEnded ? 1 : 0);

  return (
    <FilterButton
      name={() => `Poll Type ${filtersSelected > 0 ? `(${filtersSelected})` : ''}`}
      listVariant="cards.noPadding"
      data-testid="poll-filters-dropdown"
      {...props}
    >
      <Box p={2} sx={{ maxHeight: '300px', overflowY: 'scroll' }}>
        <Flex>
          <Label sx={{ py: 1, fontSize: 2, alignItems: 'center' }} data-testid="checkbox-show-polls-active">
            <Checkbox
              sx={{ width: 3, height: 3 }}
              checked={showPollActive}
              onChange={event => {
                setShowPollActive(event.target.checked);
                trackButtonClick(`activePollsFilterToggle${event.target.checked ? 'Checked' : 'Unchecked'}`);
              }}
            />
            <Flex sx={{ justifyContent: 'space-between', width: '100%' }}>
              <Text>Active Polls</Text>
              <Text sx={{ color: 'muted', ml: 3 }}>
                {filteredPollsOnlyCategories.filter(p => isActivePoll(p)).length}
              </Text>
            </Flex>
          </Label>
        </Flex>
        <Flex>
          <Label sx={{ py: 1, fontSize: 2, alignItems: 'center' }} data-testid="checkbox-show-polls-ended">
            <Checkbox
              sx={{ width: 3, height: 3 }}
              checked={showPollEnded}
              onChange={event => {
                setShowPollEnded(event.target.checked);
                trackButtonClick(`endedPollsFilterToggle${event.target.checked ? 'Checked' : 'Unchecked'}`);
              }}
            />
            <Flex sx={{ justifyContent: 'space-between', width: '100%' }}>
              <Text>Ended Polls</Text>
              <Text sx={{ color: 'muted', ml: 3 }}>
                {filteredPollsOnlyCategories.filter(p => !isActivePoll(p)).length}
              </Text>
            </Flex>
          </Label>
        </Flex>
        <Divider />
        <Flex sx={{ flexDirection: 'column' }}>
          {tags.map(category => (
            <Flex key={`category-filter-${category.id}`}>
              <Label sx={{ py: 1, fontSize: 2, alignItems: 'center' }}>
                <Checkbox
                  sx={{ width: 3, height: 3 }}
                  checked={(categoryFilter && categoryFilter[category.id]) || false}
                  onChange={event => {
                    setCategoryFilter({ ...categoryFilter, [category.id]: event.target.checked });
                    trackButtonClick(
                      `${category.id}FilterToggle${event.target.checked ? 'Checked' : 'Unchecked'}`
                    );
                  }}
                />
                <Flex sx={{ justifyContent: 'space-between', width: '100%' }}>
                  <Text>{category.longname}</Text>
                  <Text sx={{ color: 'muted', ml: 3 }}>
                    {
                      filteredPollsNoCategories.filter(
                        i => i.tags.filter(tag => tag.id === category.id).length > 0
                      ).length
                    }
                  </Text>
                </Flex>
              </Label>
            </Flex>
          ))}
        </Flex>
      </Box>
      <Box sx={{ borderTop: '1px solid', borderColor: 'outline' }}>
        <Text as="p" sx={{ color: 'primary', textAlign: 'center', fontWeight: 'semiBold', p: 2 }}>
          {filteredPolls.length} Results
        </Text>
      </Box>
    </FilterButton>
  );
}
