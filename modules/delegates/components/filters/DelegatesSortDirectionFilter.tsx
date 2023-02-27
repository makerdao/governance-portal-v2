/*

SPDX-FileCopyrightText: © 2023 Dai Foundation <www.daifoundation.org>

SPDX-License-Identifier: AGPL-3.0-or-later

*/

import useDelegatesFiltersStore from '../../stores/delegatesFiltersStore';
import { ListboxInput, ListboxButton, ListboxPopover, ListboxList, ListboxOption } from '@reach/listbox';
import { Icon } from '@makerdao/dai-ui-icons';
import { OrderDirectionEnum } from 'modules/delegates/delegates.constants';

export function DelegatesSortDirectionFilter(): JSX.Element {
  const [sortDirection, setSortDirection] = useDelegatesFiltersStore(state => [
    state.sortDirection,
    state.setSortDirection
  ]);

  return (
    <ListboxInput sx={{ ml: 2 }} onChange={setSortDirection} defaultValue={sortDirection}>
      <ListboxButton
        sx={{ variant: 'listboxes.default.button', fontWeight: 'semiBold', py: [2] }}
        arrow={<Icon name="chevron_down" size={2} />}
      />
      <ListboxPopover sx={{ variant: 'listboxes.default.popover' }}>
        <ListboxList sx={{ variant: 'listboxes.default.list' }}>
          <ListboxOption label="ASC" value={OrderDirectionEnum.ASC}>
            Ascending
          </ListboxOption>
          <ListboxOption label="DESC" value={OrderDirectionEnum.DESC}>
            Descending
          </ListboxOption>
        </ListboxList>
      </ListboxPopover>
    </ListboxInput>
  );
}
