import { useRef, useEffect } from 'react';
import { Grid, Flex, Input, Text, Button } from 'theme-ui';
import shallow from 'zustand/shallow';

import FilterButton from 'modules/app/components/FilterButton';
import useUiFiltersStore from 'stores/uiFilters';

const displayDate = date => {
  try {
    return date ? date.toISOString().substring(0, 10) : '';
  } catch (_) {
    return '';
  }
};

export default function DateFilter(props): JSX.Element {
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

  return (
    <FilterButton
      name={() => {
        if (!startDateDisplay && !endDateDisplay) return 'Date Filter';
        if (!startDateDisplay) return `Date Filter: before ${endDateDisplay}`;
        if (!endDateDisplay) return `Date Filter: after ${startDateDisplay}`;
        return `Date Filter: ${startDateDisplay} - ${endDateDisplay}`;
      }}
      {...props}
    >
      <Grid gap={2} columns="max-content max-content" sx={{ alignItems: 'baseline' }}>
        <Text>Ended after:</Text>
        <Flex sx={{ alignItems: 'center' }}>
          <Input
            ref={startInput}
            type="date"
            onChange={e => setStartDate('poll', new Date(e.target.value))}
          />
        </Flex>

        <Text>Ended before:</Text>
        <Flex sx={{ alignItems: 'center' }}>
          <Input ref={endInput} type="date" onChange={e => setEndDate('poll', new Date(e.target.value))} />
        </Flex>

        <span />
        <Button onClick={reset} variant="smallOutline">
          reset
        </Button>
      </Grid>
    </FilterButton>
  );
}
