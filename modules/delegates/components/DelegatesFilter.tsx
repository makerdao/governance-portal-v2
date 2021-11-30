import { Flex, Checkbox, Label, Text, Divider } from 'theme-ui';
import shallow from 'zustand/shallow';
import FilterButton from 'modules/app/components/FilterButton';
import { Delegate } from '../types';
import useDelegatesFiltersStore from '../stores/delegatesFiltersStore';
import { DelegateStatusEnum } from '../delegates.constants';

export default function DelegatesFilter({ delegates, ...props }: { delegates: Delegate[] }): JSX.Element {
  const [showRecognized, showUnrecognized, setShowRecognizedFilter, setShowUnrecognizedFilter] =
    useDelegatesFiltersStore(
      state => [
        state.filters.showRecognized,
        state.filters.showUnrecognized,
        state.setShowRecognizedFilter,
        state.setShowUnrecognizedFilter
      ],
      shallow
    );

  const itemsSelected = [showRecognized, showUnrecognized].filter(i => !!i).length;

  return (
    <FilterButton name={() => `Delegate Type ${itemsSelected > 0 ? `(${itemsSelected})` : ''}`} {...props}>
      <Flex>
        <Label sx={{ py: 1, fontSize: 2, alignItems: 'center' }}>
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
        <Label sx={{ py: 1, fontSize: 2, alignItems: 'center' }}>
          <Checkbox
            sx={{ width: 3, height: 3 }}
            checked={showUnrecognized}
            onChange={event => setShowUnrecognizedFilter(event.target.checked)}
          />
          <Flex sx={{ justifyContent: 'space-between', width: '100%' }}>
            <Text>Unrecognized Delegates</Text>
            <Text sx={{ color: 'muted', ml: 3 }}>
              {delegates.filter(p => p.status === DelegateStatusEnum.shadow).length}
            </Text>
          </Flex>
        </Label>
      </Flex>
    </FilterButton>
  );
}
