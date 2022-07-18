import { Flex, Checkbox, Label, Text, Box } from 'theme-ui';
import shallow from 'zustand/shallow';
import FilterButton from 'modules/app/components/FilterButton';
import { Delegate } from 'modules/delegates/types';
import useDelegatesFiltersStore from 'modules/delegates/stores/delegatesFiltersStore';
import { DelegateStatusEnum } from 'modules/delegates/delegates.constants';
import { useMemo } from 'react';
import { filterDelegates } from 'modules/delegates/helpers/filterDelegates';

export function DelegatesStatusFilter({ delegates }: { delegates: Delegate[] }): JSX.Element {
  const [
    showRecognized,
    showShadow,
    showExpired,
    name,
    delegateTags,
    setShowRecognizedFilter,
    setShowShadowFilter,
    setShowExpiredFilter
  ] = useDelegatesFiltersStore(
    state => [
      state.filters.showRecognized,
      state.filters.showShadow,
      state.filters.showExpired,
      state.filters.name,
      state.filters.tags,
      state.setShowRecognizedFilter,
      state.setShowShadowFilter,
      state.setShowExpiredFilter
    ],
    shallow
  );

  const itemsSelected = [showRecognized, showShadow, showExpired].filter(i => !!i).length;

  // Use filtered delegates to show the right amount of each type of delegates (ignoring the current filter ones)
  const filteredDelegates = useMemo(() => {
    return filterDelegates(delegates, true, true, true, name, delegateTags);
  }, [delegates, name, delegateTags]);

  return (
    <FilterButton
      name={() => `Status ${itemsSelected > 0 ? `(${itemsSelected})` : ''}`}
      listVariant="cards.noPadding"
      data-testid="delegate-type-filter"
      active={itemsSelected > 0}
    >
      <Box p={2}>
        <Flex>
          <Label
            sx={{ py: 1, fontSize: 2, alignItems: 'center' }}
            data-testid="delegate-type-filter-show-recognized"
          >
            <Checkbox
              sx={{ width: 3, height: 3 }}
              checked={showRecognized}
              onChange={event => setShowRecognizedFilter(event.target.checked)}
            />
            <Flex sx={{ justifyContent: 'space-between', width: '100%' }}>
              <Text>Recognized Delegates</Text>
              <Text sx={{ color: 'mutedAlt', ml: 3 }}>
                {filteredDelegates.filter(p => p.status === DelegateStatusEnum.recognized).length}
              </Text>
            </Flex>
          </Label>
        </Flex>
        <Flex>
          <Label
            sx={{ py: 1, fontSize: 2, alignItems: 'center' }}
            data-testid="delegate-type-filter-show-shadow"
          >
            <Checkbox
              sx={{ width: 3, height: 3 }}
              checked={showShadow}
              onChange={event => setShowShadowFilter(event.target.checked)}
            />
            <Flex sx={{ justifyContent: 'space-between', width: '100%' }}>
              <Text>Shadow Delegates</Text>
              <Text sx={{ color: 'mutedAlt', ml: 3 }}>
                {filteredDelegates.filter(p => p.status === DelegateStatusEnum.shadow).length}
              </Text>
            </Flex>
          </Label>
        </Flex>
        <Flex>
          <Label
            sx={{ py: 1, fontSize: 2, alignItems: 'center' }}
            data-testid="delegate-type-filter-show-expired"
          >
            <Checkbox
              sx={{ width: 3, height: 3 }}
              checked={showExpired}
              onChange={event => setShowExpiredFilter(event.target.checked)}
            />
            <Flex sx={{ justifyContent: 'space-between', width: '100%' }}>
              <Text>Expired Delegates</Text>
              <Text sx={{ color: 'mutedAlt', ml: 3 }}>
                {filteredDelegates.filter(p => p.status === DelegateStatusEnum.expired).length}
              </Text>
            </Flex>
          </Label>
        </Flex>
      </Box>
    </FilterButton>
  );
}