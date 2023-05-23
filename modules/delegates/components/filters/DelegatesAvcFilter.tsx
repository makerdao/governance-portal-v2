/*

SPDX-FileCopyrightText: © 2023 Dai Foundation <www.daifoundation.org>

SPDX-License-Identifier: AGPL-3.0-or-later

*/

import { Flex, Box, Checkbox, Label, Text, ThemeUIStyleObject } from 'theme-ui';
import shallow from 'zustand/shallow';
import FilterButton from 'modules/app/components/FilterButton';
import { AvcAndCount } from 'modules/delegates/types/avc';
import useDelegatesFiltersStore from 'modules/delegates/stores/delegatesFiltersStore';

export function DelegatesAvcFilter({
  avcs,
  ...props
}: {
  avcs: AvcAndCount[];
  sx?: ThemeUIStyleObject;
}): JSX.Element | null {
  const [delegateAvcs, setAvcs] = useDelegatesFiltersStore(
    state => [state.filters.avcs, state.setAvcFilter],
    shallow
  );

  const itemsSelected = delegateAvcs.length;

  return avcs.length > 0 ? (
    <FilterButton
      name={() => `AVC ${itemsSelected > 0 ? `(${itemsSelected})` : ''}`}
      listVariant="cards.noPadding"
      data-testid="delegates-filters-dropdown"
      active={itemsSelected > 0}
      {...props}
    >
      <Box p={2} sx={{ maxHeight: '300px', overflowY: 'scroll' }}>
        <Flex sx={{ flexDirection: 'column' }}>
          {avcs.map(({ avc_name, count }) => (
            <Flex key={avc_name}>
              <Label variant="thinLabel" sx={{ py: 1, fontSize: 2, alignItems: 'center' }}>
                <Checkbox
                  sx={{ width: 3, height: 3 }}
                  checked={delegateAvcs.includes(avc_name)}
                  onChange={event => {
                    setAvcs(
                      event.target.checked
                        ? [...delegateAvcs, avc_name]
                        : delegateAvcs.filter(c => c !== avc_name)
                    );
                  }}
                />
                <Flex sx={{ justifyContent: 'space-between', width: '100%' }}>
                  <Text>{avc_name}</Text>
                  <Text sx={{ color: 'secondaryEmphasis', ml: 3 }}>{count}</Text>
                </Flex>
              </Label>
            </Flex>
          ))}
        </Flex>
      </Box>
    </FilterButton>
  ) : null;
}
