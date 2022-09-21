import { Flex, Box, Checkbox, Label, Text, ThemeUIStyleObject } from 'theme-ui';
import shallow from 'zustand/shallow';
import { Poll } from 'modules/polling/types';
import FilterButton from 'modules/app/components/FilterButton';
import useUiFiltersStore from 'modules/app/stores/uiFilters';
import { useMemo } from 'react';
import { filterPolls } from '../../helpers/filterPolls';
import { PollVictoryConditions } from 'modules/polling/polling.constants';
import { findVictoryCondition } from 'modules/polling/helpers/utils';

const VICTORY_CONDITIONS = [
  {
    name: 'Plurality',
    key: PollVictoryConditions.plurality
  },
  {
    name: 'Ranked Choice',
    key: PollVictoryConditions.instantRunoff
  },
  {
    name: 'Majority',
    key: PollVictoryConditions.majority
  },
  {
    name: 'Approval',
    key: PollVictoryConditions.approval
  }
];

export function PollTypeFilter({ polls, ...props }: { polls: Poll[]; sx?: ThemeUIStyleObject }): JSX.Element {
  const [pollFilters, pollVictoryCondition, setPollVictoryCondition] = useUiFiltersStore(
    state => [state.pollFilters, state.pollFilters.pollVictoryCondition, state.setPollVictoryCondition],
    shallow
  );

  const itemsSelected = Object.values(pollVictoryCondition || {}).filter(i => !!i);

  const filteredPolls = useMemo(() => {
    return filterPolls({
      polls,
      pollFilters: {
        ...pollFilters,
        pollVictoryCondition: null
      }
    });
  }, [polls, pollFilters]);

  return (
    <FilterButton
      name={() => `Type ${itemsSelected.length > 0 ? `(${itemsSelected.length})` : ''}`}
      listVariant="cards.noPadding"
      data-testid="poll-filters-type"
      active={itemsSelected.length > 0}
      {...props}
    >
      <Box p={2} sx={{ maxHeight: '300px', overflowY: 'scroll' }}>
        <Flex sx={{ flexDirection: 'column' }}>
          {VICTORY_CONDITIONS.map(type => (
            <Flex key={type.key}>
              <Label sx={{ py: 1, fontSize: 2, alignItems: 'center' }}>
                <Checkbox
                  sx={{ width: 3, height: 3 }}
                  checked={(pollVictoryCondition && pollVictoryCondition[type.key]) || false}
                  onChange={event => {
                    setPollVictoryCondition({ ...pollVictoryCondition, [type.key]: event.target.checked });
                  }}
                />
                <Flex sx={{ justifyContent: 'space-between', width: '100%' }}>
                  <Text>{type.name}</Text>
                  <Text sx={{ color: 'secondaryEmphasis', ml: 3 }}>
                    {
                      filteredPolls.filter(
                        i => findVictoryCondition(i.parameters.victoryConditions, type.key).length > 0
                      ).length
                    }
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
