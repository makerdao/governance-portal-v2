import shallow from 'zustand/shallow';
import useUiFiltersStore, { PollsSortEnum } from 'modules/app/stores/uiFilters';
import { ListboxInput, ListboxButton, ListboxPopover, ListboxList, ListboxOption } from '@reach/listbox';
import { Icon } from '@makerdao/dai-ui-icons';

export default function PollsSort(): JSX.Element {
  const [sort, setSort] = useUiFiltersStore(state => [state.pollsSortBy, state.setPollsSortBy], shallow);

  return (
    <ListboxInput onChange={setSort} defaultValue={sort}>
      <ListboxButton
        sx={{ variant: 'listboxes.default.button', fontWeight: 'semiBold', py: [2] }}
        arrow={<Icon name="chevron_down" size={2} />}
      />
      <ListboxPopover sx={{ variant: 'listboxes.default.popover' }}>
        <ListboxList sx={{ variant: 'listboxes.default.list' }}>
          <ListboxOption label="Sort by posted on date" value={PollsSortEnum.startDate}>
            Posted On
          </ListboxOption>
          <ListboxOption label="Creation date" value={PollsSortEnum.endDate}>
            Expiry
          </ListboxOption>
        </ListboxList>
      </ListboxPopover>
    </ListboxInput>
  );
}
