import FilterButton from '../FilterButton';
import { Grid, Flex, Input, IconButton, Text } from 'theme-ui';
import { Icon } from '@makerdao/dai-ui-icons';

const displayDate = date => (date ? date.toISOString().substring(0, 10) : '');

export default function({ startDate, endDate, setStartDate, setEndDate, ...props }) {
  return (
    <FilterButton
      name={() => {
        if (!startDate && !endDate) return 'Date Filter';
        if (!startDate) return `Date Filter: before ${displayDate(endDate)}`;
        if (!endDate) return `Date Filter: after ${displayDate(startDate)}`;
        return `Date Filter: ${displayDate(startDate)} - ${displayDate(endDate)}`;
      }}
      {...props}
    >
      <Grid gap={2} columns="max-content max-content" sx={{ alignItems: 'baseline' }}>
        <Text>After</Text>
        <Flex sx={{ alignItems: 'center' }}>
          <Input
            type="date"
            value={displayDate(startDate)}
            onChange={e => setStartDate(new Date(e.target.value))}
          />
          <IconButton onClick={() => setStartDate('')}>
            <Icon name="close" size="12px" />
          </IconButton>
        </Flex>

        <Text>Before</Text>
        <Flex sx={{ alignItems: 'center' }}>
          <Input
            type="date"
            value={displayDate(endDate)}
            onChange={e => setEndDate(new Date(e.target.value))}
          />
          <IconButton onClick={() => setEndDate('')}>
            <Icon name="close" size="12px" />
          </IconButton>
        </Flex>
      </Grid>
    </FilterButton>
  );
}
