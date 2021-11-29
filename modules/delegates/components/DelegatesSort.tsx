import shallow from 'zustand/shallow';
import useDelegatesFiltersStore, { delegatesSortEnum } from '../stores/delegatesFiltersStore';
import { ListboxInput, ListboxButton, ListboxPopover, ListboxList, ListboxOption } from '@reach/listbox';
import { Icon } from '@makerdao/dai-ui-icons';

export default function DelegatesSort(): JSX.Element {
  const [sort, setSort] = useDelegatesFiltersStore(state => [state.sort, state.setSort], shallow);

  return (
    <ListboxInput onChange={setSort} defaultValue={sort}>
      <ListboxButton
        sx={{ variant: 'listboxes.default.button', fontWeight: 'semiBold', py: [0, 2] }}
        arrow={<Icon name="chevron_down" size={2} />}
      />
      <ListboxPopover sx={{ variant: 'listboxes.default.popover' }}>
        <ListboxList sx={{ variant: 'listboxes.default.list' }}>
          <ListboxOption value={delegatesSortEnum.mkrDelegated}>Sort by MKR delegated</ListboxOption>
          <ListboxOption value={delegatesSortEnum.random}>Sort randomly</ListboxOption>
          <ListboxOption value={delegatesSortEnum.creationDate}>Sort by date</ListboxOption>
        </ListboxList>
      </ListboxPopover>
    </ListboxInput>
  );
}
