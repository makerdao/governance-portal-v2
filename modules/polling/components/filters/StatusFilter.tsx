import { Flex, Box, Checkbox, Label, Text, ThemeUIStyleObject } from 'theme-ui';
import shallow from 'zustand/shallow';
import { Poll } from 'modules/polling/types';
import FilterButton from 'modules/app/components/FilterButton';
import useUiFiltersStore from 'modules/app/stores/uiFilters';
import { isActivePoll } from 'modules/polling/helpers/utils';
import { useMemo } from 'react';
import { filterPolls } from '../../helpers/filterPolls';
import { useAnalytics } from 'modules/app/client/analytics/useAnalytics';
import { ANALYTICS_PAGES } from 'modules/app/client/analytics/analytics.constants';

export function StatusFilter({ polls, ...props }: { polls: Poll[]; sx?: ThemeUIStyleObject }): JSX.Element {
  const { trackButtonClick } = useAnalytics(ANALYTICS_PAGES.POLLING);
  const [pollFilters, showPollActive, showPollEnded, setShowPollActive, setShowPollEnded] = useUiFiltersStore(
    state => [
      state.pollFilters,
      state.pollFilters.showPollActive,
      state.pollFilters.showPollEnded,
      state.setShowPollActive,
      state.setShowPollEnded
    ],
    shallow
  );

  const filteredPollsOnlyCategories = useMemo(() => {
    return filterPolls({
      polls,
      pollFilters: {
        ...pollFilters,
        showPollActive: true,
        showPollEnded: true
      }
    });
  }, [polls, pollFilters]);

  const filtersSelected = (showPollActive ? 1 : 0) + (showPollEnded ? 1 : 0);

  return (
    <FilterButton
      name={() => `Status ${filtersSelected > 0 ? `(${filtersSelected})` : ''}`}
      listVariant="cards.noPadding"
      data-testid="poll-filters-status"
      active={filtersSelected > 0}
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
              <Text sx={{ color: 'secondaryEmphasis', ml: 3 }}>
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
              <Text sx={{ color: 'secondaryEmphasis', ml: 3 }}>
                {filteredPollsOnlyCategories.filter(p => !isActivePoll(p)).length}
              </Text>
            </Flex>
          </Label>
        </Flex>
      </Box>
    </FilterButton>
  );
}
