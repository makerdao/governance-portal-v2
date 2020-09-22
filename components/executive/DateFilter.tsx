/** @jsx jsx */
import { useRef, useEffect } from 'react';
import { Grid, Flex, Input, Text, Button, jsx } from 'theme-ui';
import shallow from 'zustand/shallow';

import FilterButton from '../FilterButton';
import useUiFiltersStore from '../../stores/uiFilters';

const displayDate = date => {
  try {
    return date ? date.toISOString().substring(0, 10) : '';
  } catch (_) {
    return '';
  }
};

export default function (props): JSX.Element {
  const [startDate, setStartDate, endDate, setEndDate] = useUiFiltersStore(
    state => [
      state.executiveFilters.startDate,
      state.setStartDate,
      state.executiveFilters.endDate,
      state.setEndDate
    ],
    shallow
  );

  const startDateDisplay = displayDate(startDate);
  const endDateDisplay = displayDate(endDate);
  const startInput = useRef<HTMLInputElement>(null);
  const endInput = useRef<HTMLInputElement>(null);

  const reset = () => {
    setStartDate('executive', null);
    setEndDate('executive', null);
  };

  useEffect(() => {
    if (startInput.current && startDate === null) startInput.current.value = '';
    if (endInput.current && endDate === null) endInput.current.value = '';
  }, [startDate, endDate]);

  return (
    <FilterButton
      name={() => {
        if (!startDateDisplay && !endDateDisplay) return 'Date Posted';
        if (!startDateDisplay) return `Date Posted: before ${endDateDisplay}`;
        if (!endDateDisplay) return `Date Posted: after ${startDateDisplay}`;
        return `Date Posted: ${startDateDisplay} - ${endDateDisplay}`;
      }}
      {...props}
    >
      <Grid gap={2} columns="max-content max-content" sx={{ alignItems: 'baseline' }}>
        <Text>After</Text>
        <Flex sx={{ alignItems: 'center' }}>
          <Input
            ref={startInput}
            type="date"
            onChange={e => setStartDate('executive', new Date(e.target.value))}
          />
        </Flex>

        <Text>Before</Text>
        <Flex sx={{ alignItems: 'center' }}>
          <Input
            ref={endInput}
            type="date"
            onChange={e => setEndDate('executive', new Date(e.target.value))}
          />
        </Flex>

        <span />
        <Button onClick={reset} variant="smallOutline">
          reset
        </Button>
      </Grid>
    </FilterButton>
  );
}
