/** @jsx jsx */
import { jsx } from 'theme-ui';
import { ListboxInput, ListboxButton, ListboxPopover, ListboxList, ListboxOption } from '@reach/listbox';
import { Icon } from '@makerdao/dai-ui-icons';
import map from 'lodash/map';

import { Poll } from 'modules/polling/types';

type Props = { poll: Poll; choice: number | null; setChoice: (number) => void };
export default function SingleSelect({ poll, choice, setChoice, ...props }: Props): JSX.Element {
  return (
    <ListboxInput
      data-testid="single select"
      onChange={x => {
        setChoice(parseInt(x));
      }}
      defaultValue={choice !== null ? choice.toString() : 'default'}
      {...props}
    >
      <ListboxButton
        sx={{ variant: 'listboxes.default.button', fontWeight: 400, py: [0, 2] }}
        arrow={<Icon name="chevron_down" size={2} />}
      />
      <ListboxPopover sx={{ variant: 'listboxes.default.popover' }}>
        <ListboxList sx={{ variant: 'listboxes.default.list' }}>
          <ListboxOption value="default" sx={{ display: 'none' }}>
            Your choice
          </ListboxOption>
          {map(poll.options, (label, id) => (
            <ListboxOption data-testid={'single select option'} key={id} value={id}>
              {label}
            </ListboxOption>
          ))}
        </ListboxList>
      </ListboxPopover>
    </ListboxInput>
  );
}
