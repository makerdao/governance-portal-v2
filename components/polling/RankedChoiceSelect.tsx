/** @jsx jsx */
import { useMemo, useState } from 'react';
import { Box, Flex, Text, Close, jsx } from 'theme-ui';
import { ListboxInput, ListboxButton, ListboxPopover, ListboxList, ListboxOption } from '@reach/listbox';
import { Icon } from '@makerdao/dai-ui-icons';
import map from 'lodash/map';
import omitBy from 'lodash/omitBy';

import { getNumberWithOrdinal } from 'lib/utils';
import { Poll } from 'modules/polling/types';
import Stack from '../layouts/Stack';
import { useAnalytics } from 'lib/client/analytics/useAnalytics';
import { ANALYTICS_PAGES } from 'lib/client/analytics/analytics.constants';

type RankedChoiceSelectProps = {
  poll: Poll;
  choice: number[] | null;
  setChoice: (choices: number[]) => void;
};

export default function RankedChoiceSelect({
  poll,
  setChoice,
  choice: _choice,
  ...props
}: RankedChoiceSelectProps): JSX.Element {
  const { trackButtonClick } = useAnalytics(ANALYTICS_PAGES.POLLING);
  const choice = _choice || [];
  const [numConfirmed, setNumConfirmed] = useState(choice.length);
  const [showListboxInput, setShowListboxInput] = useState(true);
  const [showAddButton, setShowAddButton] = useState(false);
  const totalNumOptions = Object.keys(poll.options).length;
  const canAddOption = totalNumOptions > numConfirmed + 1;

  const availableChoices = useMemo(
    () =>
      omitBy(
        poll.options,
        (_, optionId) =>
          choice.findIndex(_choice => _choice === parseInt(optionId)) > -1 &&
          parseInt(optionId) !== choice[numConfirmed]
      ),
    [numConfirmed]
  );

  if (showListboxInput && numConfirmed === totalNumOptions) setShowListboxInput(false);
  if (numConfirmed === 0 && !showListboxInput) setShowListboxInput(true);
  if (showListboxInput && showAddButton) setShowAddButton(false);

  return (
    <Box {...props}>
      <Stack gap={2}>
        {Array.from({ length: numConfirmed }).map((_, index) => (
          <Flex sx={{ backgroundColor: 'background', py: 2, px: 3 }} key={index}>
            <Flex sx={{ flexDirection: 'column' }}>
              <Text sx={{ variant: 'text.caps', fontSize: 1 }}>{getNumberWithOrdinal(index + 1)} choice</Text>
              <Text>{poll.options[choice[index]]}</Text>
            </Flex>
            <Close
              ml="auto"
              my="auto"
              sx={{ '> svg': { size: [3] } }}
              onClick={() => {
                const newChoice = [...choice];
                newChoice.splice(index, 1);
                setNumConfirmed(numConfirmed - 1);
                setChoice(newChoice);
                if (totalNumOptions === numConfirmed && !showAddButton) setShowAddButton(true);
              }}
            />
          </Flex>
        ))}
        {showListboxInput && (
          <ListboxInput
            defaultValue={choice[numConfirmed] ? choice[numConfirmed].toString() : 'default'}
            key={numConfirmed}
            data-testid="ranked choice"
            onChange={value => {
              const newChoice = [...choice];
              newChoice[numConfirmed] = parseInt(value);
              setChoice(newChoice);
              if (canAddOption || Object.keys(availableChoices).length === 1)
                setNumConfirmed(numConfirmed + 1);
              setShowListboxInput(false);
              if (canAddOption) setShowAddButton(true);
            }}
          >
            <ListboxButton
              sx={{ variant: 'listboxes.default.button', fontWeight: 400, py: [3, 2] }}
              arrow={<Icon name="chevron_down" size={2} />}
            />
            <ListboxPopover sx={{ variant: 'listboxes.default.popover' }}>
              <ListboxList sx={{ variant: 'listboxes.default.list' }}>
                <ListboxOption data-testid="ranked choice option" value="default" sx={{ display: 'none' }}>
                  {getNumberWithOrdinal(numConfirmed + 1)} choice
                </ListboxOption>
                {map(availableChoices, (label, optionId) => (
                  <ListboxOption data-testid="ranked choice option" key={optionId} value={optionId}>
                    {label}
                  </ListboxOption>
                ))}
              </ListboxList>
            </ListboxPopover>
          </ListboxInput>
        )}
      </Stack>
      {showAddButton && (
        <Text
          color="primary"
          variant="caps"
          aria-label="Add button"
          onClick={() => {
            trackButtonClick('addAnotherRankedChoice');
            setShowListboxInput(true);
          }}
          sx={{
            pt: 2,
            pb: 1,
            fontSize: 1,
            cursor: 'pointer'
          }}
        >
          <span sx={{ mr: 1 }}>+</span> Add another choice
        </Text>
      )}
    </Box>
  );
}
