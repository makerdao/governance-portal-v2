import Poll from '../../types/poll';
import { useState, useMemo } from 'react';
import { Box, Flex, Text, Close } from 'theme-ui';
import { getNumberWithOrdinal } from '../../lib/utils';
import { ListboxInput, ListboxButton, ListboxPopover, ListboxList, ListboxOption } from '@reach/listbox';
import map from 'lodash/map';
import omitBy from 'lodash/omitBy';
import Stack from '../layouts/Stack';
import { Icon } from '@makerdao/dai-ui-icons';

type RankedChoiceSelectProps = { poll: Poll; setChoice: (choices: number[]) => void };
export default function RankedChoiceSelect({
  poll,
  setChoice,
  ...props
}: RankedChoiceSelectProps): JSX.Element {
  const [selectedChoices, setSelectedChoices] = useState<number[]>([]);
  const [optionCount, setOptionCount] = useState<number>(1);
  const numOptionsAvailable = Object.keys(poll.options).length;
  const canAddOption = numOptionsAvailable > optionCount && selectedChoices[optionCount - 1] !== undefined;

  const availableChoices = useMemo(
    () =>
      omitBy(poll.options, (_, pollId) => {
        return selectedChoices.findIndex(choice => choice === parseInt(pollId)) > -1;
      }),
    [optionCount]
  );

  return (
    <Box {...props}>
      <Stack gap={2}>
        {Array.from({ length: optionCount - 1 }).map((_, index) => (
          <Flex sx={{ backgroundColor: 'background', py: 2, px: 3 }} key={index}>
            <Flex sx={{ flexDirection: 'column' }}>
              <Text sx={{ textTransform: 'uppercase', fontSize: 1, fontWeight: 'bold' }}>
                {getNumberWithOrdinal(index + 1)} choice
              </Text>
              <Text>{poll.options[selectedChoices[index]]}</Text>
            </Flex>
            <Close
              ml="auto"
              my="auto"
              sx={{ '> svg': { size: [3] } }}
              onClick={() => {
                const newChoices = [...selectedChoices];
                newChoices.splice(index, 1);
                setSelectedChoices(newChoices);
                setOptionCount(optionCount - 1);
              }}
            />
          </Flex>
        ))}
        <ListboxInput
          key={optionCount}
          onChange={value => {
            const newChoices = [...selectedChoices];
            newChoices[optionCount - 1] = parseInt(value);
            setSelectedChoices(newChoices);
            if (setChoice) setChoice(newChoices);
          }}
        >
          <ListboxButton
            sx={{ variant: 'listboxes.default.button' }}
            arrow={<Icon name="chevron_down" size={2} />}
          />
          <ListboxPopover sx={{ variant: 'listboxes.default.popover' }}>
            <ListboxList sx={{ variant: 'listboxes.default.list' }}>
              <ListboxOption value="default" sx={{ display: 'none' }}>
                {getNumberWithOrdinal(selectedChoices.length + 1)} choice
              </ListboxOption>
              {map(availableChoices, (label, pollId) => (
                <ListboxOption key={pollId} value={pollId}>
                  {label}
                </ListboxOption>
              ))}
            </ListboxList>
          </ListboxPopover>
        </ListboxInput>
      </Stack>
      {canAddOption && (
        <Text
          color="primary"
          onClick={() => setOptionCount(optionCount + 1)}
          sx={{
            pt: 1,
            fontSize: 2,
            cursor: 'pointer',
            textTransform: 'uppercase'
          }}
        >
          <span sx={{ mr: 2 }}>+</span> Add another choice
        </Text>
      )}
    </Box>
  );
}
