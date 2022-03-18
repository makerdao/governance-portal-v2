import shallow from 'zustand/shallow';
import useDelegatesFiltersStore, { delegatesSortEnum } from '../stores/delegatesFiltersStore';
import { ListboxInput, ListboxButton, ListboxPopover, ListboxList, ListboxOption } from '@reach/listbox';
import { Icon } from '@makerdao/dai-ui-icons';

export default function DelegatesSort(): JSX.Element {
  const [sort, setSort] = useDelegatesFiltersStore(state => [state.sort, state.setSort], shallow);

  return (
    <ListboxInput onChange={setSort} defaultValue={sort}>
      <ListboxButton
        sx={{ variant: 'listboxes.default.button', fontWeight: 'semiBold', py: [2] }}
        arrow={<Icon name="chevron_down" size={2} />}
      />
      <ListboxPopover sx={{ variant: 'listboxes.default.popover' }}>
        <ListboxList sx={{ variant: 'listboxes.default.list' }}>
          <ListboxOption label="Sort by Default" value={delegatesSortEnum.random}>
            Default
          </ListboxOption>
          <ListboxOption label="Sort by MKR delegated" value={delegatesSortEnum.mkrDelegated}>
            MKR delegated
          </ListboxOption>
          <ListboxOption label="Creation Date" value={delegatesSortEnum.creationDate}>
            Creation Date
          </ListboxOption>
        </ListboxList>
      </ListboxPopover>
    </ListboxInput>
  );
}
