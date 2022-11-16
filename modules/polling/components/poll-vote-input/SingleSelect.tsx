import { useState, useEffect } from 'react';
import { ListboxInput, ListboxButton, ListboxPopover, ListboxList, ListboxOption } from '@reach/listbox';
import { Icon } from '@makerdao/dai-ui-icons';
import { Poll } from 'modules/polling/types';

type Props = { poll: Poll; choice: number | null; setChoice: (number) => void };

export default function SingleSelect({ poll, choice, setChoice }: Props): JSX.Element {
  const [defaultValue, setDefaultValue] = useState('default');

  useEffect(() => {
    setDefaultValue(choice ? choice.toString() : 'default');
  }, [choice]);

  return (
    <ListboxInput
      onChange={x => {
        setChoice(parseInt(x));
      }}
      defaultValue={defaultValue}
    >
      <ListboxButton
        data-testid="single-select"
        sx={{ variant: 'listboxes.default.button', fontWeight: 400 }}
        arrow={<Icon name="chevron_down" size={2} />}
      />
      <ListboxPopover sx={{ variant: 'listboxes.default.popover', zIndex: 200 }}>
        <ListboxList sx={{ variant: 'listboxes.default.list' }}>
          <ListboxOption value="default" sx={{ display: 'none' }}>
            Your choice
          </ListboxOption>
          {Object.values(poll.options).map((label, id) => (
            <ListboxOption
              data-testid={`single-select-option-${label}`}
              key={`single-select-option-${label}`}
              value={id.toString()}
            >
              {label}
            </ListboxOption>
          ))}
        </ListboxList>
      </ListboxPopover>
    </ListboxInput>
  );
}
