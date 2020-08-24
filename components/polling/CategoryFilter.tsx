import { Flex, Checkbox, Label } from 'theme-ui';
import shallow from 'zustand/shallow';

import FilterButton from '../FilterButton';
import useUiFiltersStore from '../../stores/uiFilters';

export default function ({ categories, ...props }: { categories: string[] }) {
  const [categoryFilter, setCategoryFilter] = useUiFiltersStore(
    state => [state.pollFilters.categoryFilter, state.setCategoryFilter],
    shallow
  );

  return (
    <FilterButton name={() => 'Poll Type'} {...props}>
      <Flex sx={{ flexDirection: 'column' }}>
        {categories.map(category => (
          <Flex key={category || 'undefined'}>
            <Label sx={{ py: 1, fontSize: 2, alignItems: 'center' }}>
              <Checkbox
                sx={{ width: 3, height: 3 }}
                checked={categoryFilter?.[category] === undefined || categoryFilter[category]}
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
