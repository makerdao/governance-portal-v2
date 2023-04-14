/*

SPDX-FileCopyrightText: © 2023 Dai Foundation <www.daifoundation.org>

SPDX-License-Identifier: AGPL-3.0-or-later

*/

import { Flex, Box, Checkbox, Label, Text, ThemeUIStyleObject } from 'theme-ui';
import shallow from 'zustand/shallow';
import FilterButton from 'modules/app/components/FilterButton';
import useUiFiltersStore from 'modules/app/stores/uiFilters';
import { PollInputFormat } from 'modules/polling/polling.constants';
import { PollsResponse } from 'modules/polling/types/pollsResponse';

const VICTORY_CONDITIONS = [
  {
    name: 'Plurality',
    key: PollInputFormat.singleChoice
  },
  {
    name: 'Ranked Choice',
    key: PollInputFormat.rankFree
  },
  {
    name: 'Majority',
    key: PollInputFormat.majority
  },
  {
    name: 'Approval',
    key: PollInputFormat.chooseFree
  }
];

export function PollTypeFilter({
  stats,
  ...props
}: {
  stats: PollsResponse['stats'];
  sx?: ThemeUIStyleObject;
}): JSX.Element {
  const [pollVictoryCondition, setPollVictoryCondition] = useUiFiltersStore(
    state => [state.pollFilters.pollVictoryCondition, state.setPollVictoryCondition],
    shallow
  );

  const itemsSelected = pollVictoryCondition?.length || 0;

  return (
    <FilterButton
      name={() => `Type ${itemsSelected > 0 ? `(${itemsSelected})` : ''}`}
      listVariant="cards.noPadding"
      data-testid="poll-filters-type"
      active={itemsSelected > 0}
      {...props}
    >
      <Box p={2} sx={{ maxHeight: '300px', overflowY: 'scroll' }}>
        <Flex sx={{ flexDirection: 'column' }}>
          {VICTORY_CONDITIONS.map(type => (
            <Flex key={type.key}>
              <Label sx={{ py: 1, fontSize: 2, alignItems: 'center' }}>
                <Checkbox
                  sx={{ width: 3, height: 3 }}
                  checked={pollVictoryCondition.includes(type.key)}
                  onChange={event => {
                    setPollVictoryCondition(
                      event.target.checked
                        ? [...pollVictoryCondition, type.key]
                        : pollVictoryCondition.filter(vc => vc !== type.key)
                    );
                  }}
                />
                <Flex sx={{ justifyContent: 'space-between', width: '100%' }}>
                  <Text>{type.name}</Text>
                  <Text sx={{ color: 'secondaryEmphasis', ml: 3 }}>
                    {stats.type ? stats.type[type.key] : 0}
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
