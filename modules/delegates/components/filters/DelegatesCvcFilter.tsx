/*

SPDX-FileCopyrightText: © 2023 Dai Foundation <www.daifoundation.org>

SPDX-License-Identifier: AGPL-3.0-or-later

*/

import { Flex, Box, Checkbox, Label, Text, ThemeUIStyleObject } from 'theme-ui';
import shallow from 'zustand/shallow';
import FilterButton from 'modules/app/components/FilterButton';
import { useMemo } from 'react';
import { CvcAndCount } from 'modules/delegates/types/cvc';
import { Delegate } from 'modules/delegates/types';
import useDelegatesFiltersStore from 'modules/delegates/stores/delegatesFiltersStore';
import { filterDelegates } from 'modules/delegates/helpers/filterDelegates';

export function DelegatesCvcFilter({
  cvcs,
  delegates,
  ...props
}: {
  cvcs: CvcAndCount[];
  delegates: Delegate[];
  sx?: ThemeUIStyleObject;
}): JSX.Element {
  const [delegateFilters, setCvcs, name] = useDelegatesFiltersStore(
    state => [state.filters, state.setCvcFilter, state.filters.name],
    shallow
  );

  const itemsSelected = Object.values(delegateFilters.cvcs || {}).filter(i => !!i).length;

  const filteredDelegates = useMemo(() => {
    return filterDelegates(
      delegates,
      delegateFilters.showShadow,
      delegateFilters.showConstitutional,
      delegateFilters.showExpired,
      name,
      delegateFilters.cvcs
    );
  }, [delegates, delegateFilters]);

  return (
    <FilterButton
      name={() => `CVC ${itemsSelected > 0 ? `(${itemsSelected})` : ''}`}
      listVariant="cards.noPadding"
      data-testid="delegates-filters-dropdown"
      active={itemsSelected > 0}
      {...props}
    >
      <Box p={2} sx={{ maxHeight: '300px', overflowY: 'scroll' }}>
        <Flex sx={{ flexDirection: 'column' }}>
          {cvcs.map(cvc => (
            <Flex key={cvc.cvc_name}>
              <Label variant="thinLabel" sx={{ py: 1, fontSize: 2, alignItems: 'center' }}>
                <Checkbox
                  sx={{ width: 3, height: 3 }}
                  checked={(delegateFilters.cvcs && delegateFilters.cvcs[cvc.cvc_name]) || false}
                  onChange={event => {
                    setCvcs({ ...delegateFilters.cvcs, [cvc.cvc_name]: event.target.checked });
                  }}
                />
                <Flex sx={{ justifyContent: 'space-between', width: '100%' }}>
                  <Text>{cvc.cvc_name}</Text>
                  <Text sx={{ color: 'secondaryEmphasis', ml: 3 }}>
                    {filteredDelegates.filter(i => i.cvc_name === cvc.cvc_name).length}
                  </Text>
                </Flex>
              </Label>
            </Flex>
          ))}
        </Flex>
      </Box>
    </FilterButton>
  );
}
