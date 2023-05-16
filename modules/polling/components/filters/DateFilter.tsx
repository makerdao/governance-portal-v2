/*

SPDX-FileCopyrightText: © 2023 Dai Foundation <www.daifoundation.org>

SPDX-License-Identifier: AGPL-3.0-or-later

*/

import { useRef, useEffect, ChangeEvent } from 'react';
import { Grid, Flex, Input, Text, Button } from 'theme-ui';
import shallow from 'zustand/shallow';

import FilterButton from 'modules/app/components/FilterButton';
import useUiFiltersStore from 'modules/app/stores/uiFilters';

const displayDate = date => {
  try {
    return date ? date.toISOString().substring(0, 10) : '';
  } catch (_) {
    return '';
  }
};

export function DateFilter(props): JSX.Element {
  const [startDate, setStartDate, endDate, setEndDate] = useUiFiltersStore(
    state => [state.pollFilters.startDate, state.setStartDate, state.pollFilters.endDate, state.setEndDate],
    shallow
  );

  const startDateDisplay = displayDate(startDate);
  const endDateDisplay = displayDate(endDate);
  const startInput = useRef<HTMLInputElement>(null);
  const endInput = useRef<HTMLInputElement>(null);

  const reset = () => {
    setStartDate('poll', null);
    setEndDate('poll', null);
  };

  useEffect(() => {
    if (startInput.current && startDate === null) startInput.current.value = '';
    if (endInput.current && endDate === null) endInput.current.value = '';
  }, [startDate, endDate]);

  const handleStartDateChange = (e: ChangeEvent<HTMLInputElement>) => {
    // Min value verification to prevent fetching the API on every input number change
    if (new Date(e.target.value) >= new Date(e.target.min)) {
      setStartDate('poll', new Date(e.target.value));
    }
  };

  const handleEndDateChange = (e: ChangeEvent<HTMLInputElement>) => {
    // Min value verification to prevent fetching the API on every input number change
    if (new Date(e.target.value) >= new Date(e.target.min)) {
      setEndDate('poll', new Date(e.target.value));
    }
  };

  return (
    <FilterButton
      name={() => {
        if (!startDateDisplay && !endDateDisplay) return 'Date';
        if (!startDateDisplay) return `Date: before ${endDateDisplay}`;
        if (!endDateDisplay) return `Date: after ${startDateDisplay}`;
        return `Date: ${startDateDisplay} - ${endDateDisplay}`;
      }}
      active={!!startDate || !!endDate}
      {...props}
    >
      <Grid gap={2} columns="max-content max-content" sx={{ alignItems: 'baseline' }}>
        <Text>Started after:</Text>
        <Flex sx={{ alignItems: 'center' }}>
          <Input ref={startInput} type="date" min="2000-01-01" onChange={handleStartDateChange} />
        </Flex>

        <Text>Ended before:</Text>
        <Flex sx={{ alignItems: 'center' }}>
          <Input ref={endInput} type="date" min="2000-01-01" onChange={handleEndDateChange} />
        </Flex>

        <span />
        <Button onClick={reset} variant="smallOutline">
          reset
        </Button>
      </Grid>
    </FilterButton>
  );
}
