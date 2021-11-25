import { Flex, Checkbox, Label, Text, Divider } from 'theme-ui';
import shallow from 'zustand/shallow';
import { Poll, PollCategory } from 'modules/polling/types';
import FilterButton from 'modules/app/components/FilterButton';
import useUiFiltersStore from 'stores/uiFilters';
import { isActivePoll } from 'modules/polling/helpers/utils';

export default function CategoryFilter({
  categories,
  polls,
  ...props
}: {
  categories: PollCategory[];
  polls: Poll[];
}): JSX.Element {
  const [
    categoryFilter,
    setCategoryFilter,
    showPollActive,
    showPollEnded,
    setShowPollActive,
    setShowPollEnded
  ] = useUiFiltersStore(
    state => [
      state.pollFilters.categoryFilter,
      state.setCategoryFilter,
      state.pollFilters.showPollActive,
      state.pollFilters.showPollEnded,
      state.setShowPollActive,
      state.setShowPollEnded
    ],
    shallow
  );

  const itemsSelected = Object.values(categoryFilter || {}).filter(i => !!i);

  return (
    <FilterButton
      name={() => `Poll Type ${itemsSelected.length > 0 ? `(${itemsSelected.length})` : ''}`}
      {...props}
    >
      <Flex>
        <Label sx={{ py: 1, fontSize: 2, alignItems: 'center' }}>
          <Checkbox
            sx={{ width: 3, height: 3 }}
            checked={showPollActive}
            onChange={event => setShowPollActive(event.target.checked)}
          />
          <Flex sx={{ justifyContent: 'space-between', width: '100%' }}>
            <Text>Active Polls</Text>
            <Text sx={{ color: 'muted', ml: 3 }}>{polls.filter(p => isActivePoll(p)).length}</Text>
          </Flex>
        </Label>
      </Flex>
      <Flex>
        <Label sx={{ py: 1, fontSize: 2, alignItems: 'center' }}>
          <Checkbox
            sx={{ width: 3, height: 3 }}
            checked={showPollEnded}
            onChange={event => setShowPollEnded(event.target.checked)}
          />
          <Flex sx={{ justifyContent: 'space-between', width: '100%' }}>
            <Text>Ended Polls</Text>
            <Text sx={{ color: 'muted', ml: 3 }}>{polls.filter(p => !isActivePoll(p)).length}</Text>
          </Flex>
        </Label>
      </Flex>
      <Divider />
      <Flex sx={{ flexDirection: 'column' }}>
        {categories.map(category => (
          <Flex key={category.name}>
            <Label sx={{ py: 1, fontSize: 2, alignItems: 'center' }}>
              <Checkbox
                sx={{ width: 3, height: 3 }}
                checked={(categoryFilter && categoryFilter[category.name]) || false}
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
