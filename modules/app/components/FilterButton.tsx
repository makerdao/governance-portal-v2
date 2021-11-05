import { jsx } from 'theme-ui';
import { Icon } from '@makerdao/dai-ui-icons';
import { Menu, MenuButton, MenuList } from '@reach/menu-button';

type Props = { name: () => string; listVariant?: string; children: React.ReactNode };

export default function FilterButton({
  name,
  children,
  listVariant = 'cards.compact',
  ...props
}: Props): JSX.Element {
  return (
    <Menu>
      <MenuButton sx={{ variant: 'buttons.outline', lineHeight: 'inherit' }} {...props}>
        {name()}
        <Icon name="chevron_down" size={2} ml={2} />
      </MenuButton>
      <MenuList sx={{ variant: listVariant }}>{children}</MenuList>
    </Menu>
  );
}
