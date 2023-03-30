/*

SPDX-FileCopyrightText: © 2023 Dai Foundation <www.daifoundation.org>

SPDX-License-Identifier: AGPL-3.0-or-later

*/

import { Flex, Box, Checkbox, Label, Text, ThemeUIStyleObject } from 'theme-ui';
import shallow from 'zustand/shallow';
import FilterButton from 'modules/app/components/FilterButton';
import { useMemo } from 'react';
import { TagCount as CvcCount } from 'modules/app/types/tag'; //todo: change
import { Delegate } from 'modules/delegates/types';
import useDelegatesFiltersStore from 'modules/delegates/stores/delegatesFiltersStore';
import { filterDelegates } from 'modules/delegates/helpers/filterDelegates';

export function DelegatesCvcFilter({
  cvcs,
  delegates,
  ...props
}: {
  cvcs: CvcCount[];
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
            <Flex key={cvc.id}>
              <Label variant="thinLabel" sx={{ py: 1, fontSize: 2, alignItems: 'center' }}>
                <Checkbox
                  sx={{ width: 3, height: 3 }}
                  checked={(delegateFilters.cvcs && delegateFilters.cvcs[cvc.id]) || false}
                  onChange={event => {
                    setCvcs({ ...delegateFilters.cvcs, [cvc.id]: event.target.checked });
                  }}
                />
                <Flex sx={{ justifyContent: 'space-between', width: '100%' }}>
                  <Text>{cvc.longname ? cvc.longname : cvc.shortname}</Text>
                  <Text sx={{ color: 'secondaryEmphasis', ml: 3 }}>
                    {filteredDelegates.filter(i => i.cvcs.find(t => t.id === cvc.id)).length}
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
