/*

SPDX-FileCopyrightText: © 2023 Dai Foundation <www.daifoundation.org>

SPDX-License-Identifier: AGPL-3.0-or-later

*/

import Icon from './Icon';
import { Menu, MenuButton, MenuList } from '@reach/menu-button';
import { ThemeUIStyleObject } from 'theme-ui';

type Props = {
  name: () => string;
  listVariant?: string;
  active?: boolean;
  children: React.ReactNode;
  sx?: ThemeUIStyleObject;
};

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
        <Icon name="chevron_down" size={2} sx={{ ml: 2 }} />
      </MenuButton>
      <MenuList sx={{ variant: listVariant }}>{children}</MenuList>
    </Menu>
  );
}
