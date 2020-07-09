/** @jsx jsx */
import { jsx } from 'theme-ui';
import { Button, Box, Card } from 'theme-ui';
import { Icon } from '@makerdao/dai-ui-icons';
import { useState } from 'react';
import { Menu, MenuButton, MenuList } from '@reach/menu-button';

type Props = { name: () => string; children: React.ReactNode };

export default function({ name, children }: Props) {
  return (
    <Menu>
      <MenuButton sx={{ variant: 'buttons.outline' }}>
        {name()}
        <Icon name="chevron_down" size={2} ml={2} />
      </MenuButton>
      <MenuList sx={{ variant: 'cards.primary', p: 3 }}>{children}</MenuList>
    </Menu>
  );
}
