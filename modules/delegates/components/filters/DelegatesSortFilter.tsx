/*

SPDX-FileCopyrightText: © 2023 Dai Foundation <www.daifoundation.org>

SPDX-License-Identifier: AGPL-3.0-or-later

*/

import useDelegatesFiltersStore from '../../stores/delegatesFiltersStore';
import { ListboxInput, ListboxButton, ListboxPopover, ListboxList, ListboxOption } from '@reach/listbox';
import { Icon } from '@makerdao/dai-ui-icons';
import { DelegateOrderByEnum } from 'modules/delegates/delegates.constants';

export function DelegatesSortFilter(): JSX.Element {
  const [sort, setSort] = useDelegatesFiltersStore(state => [state.sort, state.setSort]);

  return (
    <ListboxInput onChange={setSort} defaultValue={sort}>
      <ListboxButton
        sx={{ variant: 'listboxes.default.button', fontWeight: 'semiBold', py: [2] }}
        arrow={<Icon name="chevron_down" size={2} />}
      />
      <ListboxPopover sx={{ variant: 'listboxes.default.popover' }}>
        <ListboxList sx={{ variant: 'listboxes.default.list' }}>
          <ListboxOption label="Sort by default" value={DelegateOrderByEnum.RANDOM}>
            Default
          </ListboxOption>
          <ListboxOption label="Sort by creation date" value={DelegateOrderByEnum.DATE}>
            Creation date
          </ListboxOption>
          <ListboxOption label="Sort by MKR delegated" value={DelegateOrderByEnum.MKR}>
            MKR delegated
          </ListboxOption>
          <ListboxOption label="Sort by delegators count" value={DelegateOrderByEnum.DELEGATORS}>
            Delegators count
          </ListboxOption>
        </ListboxList>
      </ListboxPopover>
    </ListboxInput>
  );
}
