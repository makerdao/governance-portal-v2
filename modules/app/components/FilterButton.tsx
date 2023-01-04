/*

SPDX-FileCopyrightText: © 2023 Dai Foundation <www.daifoundation.org>

SPDX-License-Identifier: AGPL-3.0-or-later

*/

import { Icon } from '@makerdao/dai-ui-icons';
import { Menu, MenuButton, MenuList } from '@reach/menu-button';

type Props = { name: () => string; listVariant?: string; active?: boolean; children: React.ReactNode };

export default function FilterButton({
  name,
  children,
  listVariant = 'cards.compact',
  active = false,
  ...props
}: Props): JSX.Element {
  return (
    <Menu>
      <MenuButton
        sx={{ variant: active ? 'buttons.primaryOutline' : 'buttons.outline', lineHeight: 'inherit' }}
        {...props}
      >
        {name()}
        <Icon name="chevron_down" size={2} ml={2} />
      </MenuButton>
      <MenuList sx={{ variant: listVariant }}>{children}</MenuList>
    </Menu>
  );
}
