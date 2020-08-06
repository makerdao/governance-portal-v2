import FilterButton from '../FilterButton';
import { Grid, Flex, Input, Text, Button } from 'theme-ui';
import { useRef } from 'react';

const displayDate = date => {
  try {
    return date ? date.toISOString().substring(0, 10) : '';
  } catch (_) {
    return '';
  }
};
type Props = {
  startDate: Date | null;
  endDate: Date | null;
  setStartDate: (date: Date | null) => void;
  setEndDate: (date: Date | null) => void;
};
export default function ({ startDate, endDate, setStartDate, setEndDate, ...props }: Props): JSX.Element {
  const startDateDisplay = displayDate(startDate);
  const endDateDisplay = displayDate(endDate);
  const startInput = useRef<HTMLInputElement>(null);
  const endInput = useRef<HTMLInputElement>(null);

  const reset = () => {
    setStartDate(null);
    if (startInput.current) startInput.current.value = '';
    setEndDate(null);
    if (endInput.current) endInput.current.value = '';
  };

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
        <Text>After</Text>
        <Flex sx={{ alignItems: 'center' }}>
          <Input ref={startInput} type="date" onChange={e => setStartDate(new Date(e.target.value))} />
        </Flex>

        <Text>Before</Text>
        <Flex sx={{ alignItems: 'center' }}>
          <Input ref={endInput} type="date" onChange={e => setEndDate(new Date(e.target.value))} />
        </Flex>

        <span />
        <Button onClick={reset} variant="smallOutline">
          reset
        </Button>
      </Grid>
    </FilterButton>
  );
}
