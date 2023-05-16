/*

SPDX-FileCopyrightText: © 2023 Dai Foundation <www.daifoundation.org>

SPDX-License-Identifier: AGPL-3.0-or-later

*/

import shallow from 'zustand/shallow';
import useUiFiltersStore from 'modules/app/stores/uiFilters';
import { PollOrderByEnum } from 'modules/polling/polling.constants';
import { ListboxInput, ListboxButton, ListboxPopover, ListboxList, ListboxOption } from '@reach/listbox';
import { Icon } from '@makerdao/dai-ui-icons';

export default function PollsSort(): JSX.Element {
  const [sort, setSort] = useUiFiltersStore(state => [state.pollsSortBy, state.setPollsSortBy], shallow);

  return (
    <ListboxInput onChange={setSort} value={sort}>
      <ListboxButton
        sx={{ variant: 'listboxes.default.button', fontWeight: 'semiBold', py: [2] }}
        arrow={<Icon name="chevron_down" size={2} />}
      />
      <ListboxPopover sx={{ variant: 'listboxes.default.popover' }}>
        <ListboxList sx={{ variant: 'listboxes.default.list' }}>
          <ListboxOption label="Sort by nearest end date" value={PollOrderByEnum.nearestEnd}>
            Nearest end date
          </ListboxOption>
          <ListboxOption label="Sort by furthest end date" value={PollOrderByEnum.furthestEnd}>
            Furthest end date
          </ListboxOption>
          <ListboxOption label="Sort by nearest start date" value={PollOrderByEnum.nearestStart}>
            Nearest start date
          </ListboxOption>
          <ListboxOption label="Sort by furthest start date" value={PollOrderByEnum.furthestStart}>
            Furthest start date
          </ListboxOption>
        </ListboxList>
      </ListboxPopover>
    </ListboxInput>
  );
}
