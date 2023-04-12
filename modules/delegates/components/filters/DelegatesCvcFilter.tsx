/*

SPDX-FileCopyrightText: © 2023 Dai Foundation <www.daifoundation.org>

SPDX-License-Identifier: AGPL-3.0-or-later

*/

import { Flex, Box, Checkbox, Label, Text, ThemeUIStyleObject } from 'theme-ui';
import shallow from 'zustand/shallow';
import FilterButton from 'modules/app/components/FilterButton';
import { CvcAndCount } from 'modules/delegates/types/cvc';
import useDelegatesFiltersStore from 'modules/delegates/stores/delegatesFiltersStore';

export function DelegatesCvcFilter({
  cvcs,
  ...props
}: {
  cvcs: CvcAndCount[];
  sx?: ThemeUIStyleObject;
}): JSX.Element | null {
  const [delegateCvcs, setCvcs] = useDelegatesFiltersStore(
    state => [state.filters.cvcs, state.setCvcFilter],
    shallow
  );

  const itemsSelected = delegateCvcs.length;

  return cvcs.length > 0 ? (
    <FilterButton
      name={() => `CVC ${itemsSelected > 0 ? `(${itemsSelected})` : ''}`}
      listVariant="cards.noPadding"
      data-testid="delegates-filters-dropdown"
      active={itemsSelected > 0}
      {...props}
    >
      <Box p={2} sx={{ maxHeight: '300px', overflowY: 'scroll' }}>
        <Flex sx={{ flexDirection: 'column' }}>
          {cvcs.map(({ cvc_name, count }) => (
            <Flex key={cvc_name}>
              <Label variant="thinLabel" sx={{ py: 1, fontSize: 2, alignItems: 'center' }}>
                <Checkbox
                  sx={{ width: 3, height: 3 }}
                  checked={delegateCvcs.includes(cvc_name) || false}
                  onChange={event => {
                    setCvcs(
                      event.target.checked
                        ? [...delegateCvcs, cvc_name]
                        : delegateCvcs.filter(c => c !== cvc_name)
                    );
                  }}
                />
                <Flex sx={{ justifyContent: 'space-between', width: '100%' }}>
                  <Text>{cvc_name}</Text>
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
