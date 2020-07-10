import FilterButton from '../FilterButton';
import { Flex, Checkbox, Label } from 'theme-ui';

export default function({ categoryFilter, setCategoryFilter, ...props }) {
  return (
    <FilterButton name={() => 'Poll Type'} {...props}>
      <Flex sx={{ flexDirection: 'column' }}>
        {Object.keys(categoryFilter).map(category => (
          <Flex key={category}>
            <Label sx={{ py: 1, fontSize: 2, alignItems: 'center' }}>
              <Checkbox
                sx={{ width: 3, height: 3 }}
                checked={categoryFilter[category]}
                onChange={event => setCategoryFilter({ ...categoryFilter, [category]: event.target.checked })}
              />
              {category}
            </Label>
          </Flex>
        ))}
      </Flex>
    </FilterButton>
  );
}
