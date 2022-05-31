import { Flex, Checkbox, Label, Text, Box } from 'theme-ui';
import shallow from 'zustand/shallow';
import FilterButton from 'modules/app/components/FilterButton';
import { Delegate } from '../../types';
import useDelegatesFiltersStore from '../../stores/delegatesFiltersStore';
import { DelegateStatusEnum } from '../../delegates.constants';
import { useMemo } from 'react';
import { filterDelegates } from '../../helpers/filterDelegates';

export default function DelegatesFilter({ delegates }: { delegates: Delegate[] }): JSX.Element {
  const [showRecognized, showShadow, name, setShowRecognizedFilter, setShowShadowFilter] =
    useDelegatesFiltersStore(
      state => [
        state.filters.showRecognized,
        state.filters.showShadow,
        state.filters.name,
        state.setShowRecognizedFilter,
        state.setShowShadowFilter
      ],
      shallow
    );

  const itemsSelected = [showRecognized, showShadow].filter(i => !!i).length;
  const filteredDelegates = useMemo(() => {
    return filterDelegates(delegates, showShadow, showRecognized, name);
  }, [delegates, showRecognized, showShadow, name]);

  return (
    <FilterButton
      name={() => `Delegate Type ${itemsSelected > 0 ? `(${itemsSelected})` : ''}`}
      listVariant="cards.noPadding"
      data-testid="delegate-type-filter"
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
              <Text sx={{ color: 'muted', ml: 3 }}>
                {delegates.filter(p => p.status === DelegateStatusEnum.recognized).length}
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
              <Text sx={{ color: 'muted', ml: 3 }}>
                {delegates.filter(p => p.status === DelegateStatusEnum.shadow).length}
              </Text>
            </Flex>
          </Label>
        </Flex>
      </Box>
    </FilterButton>
  );
}
