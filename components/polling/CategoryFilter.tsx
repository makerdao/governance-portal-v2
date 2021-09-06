import { Flex, Checkbox, Label, Text } from 'theme-ui';
import shallow from 'zustand/shallow';
import { PollCategory } from 'modules/polls/types';
import FilterButton from '../FilterButton';
import useUiFiltersStore from 'stores/uiFilters';

export default function CategoryFilter({
  categories,
  ...props
}: {
  categories: PollCategory[];
}): JSX.Element {
  const [categoryFilter, setCategoryFilter] = useUiFiltersStore(
    state => [state.pollFilters.categoryFilter, state.setCategoryFilter],
    shallow
  );

  return (
    <FilterButton name={() => 'Poll Type'} {...props}>
      <Flex sx={{ flexDirection: 'column' }}>
        {categories.map(category => (
          <Flex key={category.name}>
            <Label sx={{ py: 1, fontSize: 2, alignItems: 'center' }}>
              <Checkbox
                sx={{ width: 3, height: 3 }}
                checked={categoryFilter?.category}
                onChange={event =>
                  setCategoryFilter({ ...categoryFilter, [category.name]: event.target.checked })
                }
              />
              <Flex sx={{ justifyContent: 'space-between', width: '100%' }}>
                <Text>{category.name}</Text>
                <Text sx={{ color: 'muted', ml: 3 }}>{category.count}</Text>
              </Flex>
            </Label>
          </Flex>
        ))}
      </Flex>
    </FilterButton>
  );
}
