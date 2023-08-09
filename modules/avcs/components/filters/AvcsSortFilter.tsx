/*

SPDX-FileCopyrightText: © 2023 Dai Foundation <www.daifoundation.org>

SPDX-License-Identifier: AGPL-3.0-or-later

*/

import useAvcsFiltersStore from 'modules/avcs/stores/avcsFiltersStore';
import { ListboxInput, ListboxButton, ListboxPopover, ListboxList, ListboxOption } from '@reach/listbox';
import { Icon } from '@makerdao/dai-ui-icons';
import { AvcOrderByEnum } from 'modules/avcs/avcs.constants';
import shallow from 'zustand/shallow';

export function AvcsSortFilter(): JSX.Element {
  const [sort, setSort] = useAvcsFiltersStore(state => [state.filters.sort, state.setSort], shallow);

  return (
    <ListboxInput onChange={setSort} value={sort}>
      <ListboxButton
        sx={{ variant: 'listboxes.default.button', fontWeight: 'semiBold', py: [2] }}
        arrow={<Icon name="chevron_down" size={2} />}
      />
      <ListboxPopover sx={{ variant: 'listboxes.default.popover' }}>
        <ListboxList sx={{ variant: 'listboxes.default.list' }}>
          <ListboxOption label="Sort by default" value={AvcOrderByEnum.RANDOM}>
            Default
          </ListboxOption>
          <ListboxOption label="Sort by delegates" value={AvcOrderByEnum.DELEGATES}>
            Delegates
          </ListboxOption>
          <ListboxOption label="Sort by MKR delegated" value={AvcOrderByEnum.MKR_DELEGATED}>
            MKR delegated
          </ListboxOption>
        </ListboxList>
      </ListboxPopover>
    </ListboxInput>
  );
}
