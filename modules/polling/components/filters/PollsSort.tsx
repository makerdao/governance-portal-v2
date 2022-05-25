import shallow from 'zustand/shallow';
import useUiFiltersStore, { PollsSortEnum } from 'modules/app/stores/uiFilters';
import { ListboxInput, ListboxButton, ListboxPopover, ListboxList, ListboxOption } from '@reach/listbox';
import { Icon } from '@makerdao/dai-ui-icons';

export default function PollsSort(): JSX.Element {
  const [sort, setSort] = useUiFiltersStore(state => [state.pollsSortBy, state.setPollsSortBy], shallow);

  return (
    <ListboxInput onChange={setSort} defaultValue={sort ?? PollsSortEnum.endDateAsc}>
      <ListboxButton
        sx={{ variant: 'listboxes.default.button', fontWeight: 'semiBold', py: [2] }}
        arrow={<Icon name="chevron_down" size={2} />}
      />
      <ListboxPopover sx={{ variant: 'listboxes.default.popover' }}>
        <ListboxList sx={{ variant: 'listboxes.default.list' }}>
          <ListboxOption label="Sort by ending soonest" value={PollsSortEnum.endDateAsc}>
            Ending soonest
          </ListboxOption>
          <ListboxOption label="Sort by ending latest" value={PollsSortEnum.endDateDesc}>
            Ending latest
          </ListboxOption>
          <ListboxOption label="Sort by created latest" value={PollsSortEnum.startDateAsc}>
            Created latest
          </ListboxOption>
          <ListboxOption label="Sort by created soonest" value={PollsSortEnum.startDateDesc}>
            Created soonest
          </ListboxOption>
        </ListboxList>
      </ListboxPopover>
    </ListboxInput>
  );
}
