/*

SPDX-FileCopyrightText: © 2023 Dai Foundation <www.daifoundation.org>

SPDX-License-Identifier: AGPL-3.0-or-later

*/

import useDelegatesFiltersStore from '../../stores/delegatesFiltersStore';
import { ListboxInput, ListboxButton, ListboxPopover, ListboxList, ListboxOption } from '@reach/listbox';
import { Icon } from '@makerdao/dai-ui-icons';
import { DelegateOrderByEnum, OrderDirectionEnum } from 'modules/delegates/delegates.constants';

export function DelegatesSortFilter(): JSX.Element {
  const [sort, setSort, setSortDirection] = useDelegatesFiltersStore(state => [
    state.sort,
    state.setSort,
    state.setSortDirection
  ]);

  const setSortMethodAndDirection = (sortString: string) => {
    const [sortOption, sortDirectionOption] = sortString.split(',') as [
      DelegateOrderByEnum,
      OrderDirectionEnum | undefined
    ];

    setSort(sortOption);
    if (sortDirectionOption) {
      setSortDirection(sortDirectionOption);
    }
  };

  return (
    <ListboxInput onChange={setSortMethodAndDirection} defaultValue={sort}>
      <ListboxButton
        sx={{ variant: 'listboxes.default.button', fontWeight: 'semiBold', py: [2] }}
        arrow={<Icon name="chevron_down" size={2} />}
      />
      <ListboxPopover sx={{ variant: 'listboxes.default.popover' }}>
        <ListboxList sx={{ variant: 'listboxes.default.list' }}>
          <ListboxOption label="Sort by default" value={DelegateOrderByEnum.RANDOM}>
            Default
          </ListboxOption>
          <ListboxOption
            label="Sort by creation date (ASC)"
            value={DelegateOrderByEnum.DATE + ',' + OrderDirectionEnum.ASC}
          >
            Creation date: oldest first
          </ListboxOption>
          <ListboxOption
            label="Sort by creation date (DESC)"
            value={DelegateOrderByEnum.DATE + ',' + OrderDirectionEnum.DESC}
          >
            Creation date: newest first
          </ListboxOption>
          <ListboxOption
            label="Sort by MKR delegated (ASC)"
            value={DelegateOrderByEnum.MKR + ',' + OrderDirectionEnum.ASC}
          >
            MKR delegated: lowest first
          </ListboxOption>
          <ListboxOption
            label="Sort by MKR delegated (DESC)"
            value={DelegateOrderByEnum.MKR + ',' + OrderDirectionEnum.DESC}
          >
            MKR delegated: highest first
          </ListboxOption>
          <ListboxOption
            label="Sort by delegators count (ASC)"
            value={DelegateOrderByEnum.DELEGATORS + ',' + OrderDirectionEnum.ASC}
          >
            Delegators count: lowest first
          </ListboxOption>
          <ListboxOption
            label="Sort by delegators count (DESC)"
            value={DelegateOrderByEnum.DELEGATORS + ',' + OrderDirectionEnum.DESC}
          >
            Delegators count: highest first
          </ListboxOption>
        </ListboxList>
      </ListboxPopover>
    </ListboxInput>
  );
}
