/** @jsx jsx */
import { jsx } from 'theme-ui';
import { Icon } from '@makerdao/dai-ui-icons';
import { Menu, MenuButton, MenuList } from '@reach/menu-button';

type Props = { name: () => string; children: React.ReactNode };

export default function ({ name, children, ...props }: Props): JSX.Element {
  return (
    <Menu>
      <MenuButton sx={{ variant: 'buttons.outline' }} {...props}>
        {name()}
        <Icon name="chevron_down" size={2} ml={2} />
      </MenuButton>
      <MenuList sx={{ variant: 'cards.compact' }}>{children}</MenuList>
    </Menu>
  );
}
