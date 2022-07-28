import { useMemo, useState, useEffect } from 'react';
import { Box, Flex, Text, Close } from 'theme-ui';
import { ListboxInput, ListboxButton, ListboxPopover, ListboxList, ListboxOption } from '@reach/listbox';
import { Icon } from '@makerdao/dai-ui-icons';
import map from 'lodash/map';
import omitBy from 'lodash/omitBy';

import { getNumberWithOrdinal } from 'lib/utils';
import { Poll } from 'modules/polling/types';
import Stack from '../../../app/components/layout/layouts/Stack';
import { useAnalytics } from 'modules/app/client/analytics/useAnalytics';
import { ANALYTICS_PAGES } from 'modules/app/client/analytics/analytics.constants';

type RankedChoiceSelectProps = {
  poll: Poll;
  choice: number[] | null;
  setChoice: (choices: number[]) => void;
};

export default function RankedChoiceSelect({
  poll,
  setChoice,
  choice: _choice
}: RankedChoiceSelectProps): JSX.Element {
  const { trackButtonClick } = useAnalytics(ANALYTICS_PAGES.POLLING);
  const choice = _choice || [];
  const [numConfirmed, setNumConfirmed] = useState(choice.length);
  const [showListboxInput, setShowListboxInput] = useState(true);
  const [showAddButton, setShowAddButton] = useState(false);

  const totalNumOptions = Object.keys(poll.options).length;
  const abstainOption = Object.values(poll.options).indexOf('Abstain');
  const optionsToShow = abstainOption > -1 ? totalNumOptions - 1 : totalNumOptions;
  const canAddOption = optionsToShow > numConfirmed + 1;

  useEffect(() => {
    setNumConfirmed(choice.length);
  }, [_choice]);

  const availableChoices = useMemo(
    () =>
      omitBy(
        poll.options,
        (_, optionId) =>
          (choice.findIndex(_choice => _choice === parseInt(optionId)) > -1 &&
            parseInt(optionId) !== choice[numConfirmed]) ||
          (numConfirmed > 0 && parseInt(optionId) === abstainOption)
      ),
    [numConfirmed]
  );

  useEffect(() => {
    if (Object.keys(availableChoices).length === 0) {
      setShowListboxInput(false);
    }
  }, []);

  const handeListboxInputChange = value => {
    const newChoice = [...choice];
    newChoice[numConfirmed] = parseInt(value);
    setChoice(newChoice);
    if (canAddOption || Object.keys(availableChoices).length === 1) setNumConfirmed(numConfirmed + 1);
    setShowListboxInput(false);
    const abstaining = newChoice[0] === abstainOption;
    if (canAddOption && !abstaining) setShowAddButton(true);
  };

  const handleRemove = (e, index) => {
    const newChoice = [...choice];
    newChoice.splice(index, 1);
    setNumConfirmed(numConfirmed - 1);
    setChoice(newChoice);
    if (optionsToShow === numConfirmed && !showAddButton) setShowAddButton(true);
  };

  if (showListboxInput && numConfirmed === totalNumOptions) setShowListboxInput(false);
  if (numConfirmed === 0 && !showListboxInput) setShowListboxInput(true);
  if (showListboxInput && showAddButton) setShowAddButton(false);

  return (
    <Box>
      <Stack gap={2}>
        {Array.from({ length: numConfirmed }).map((_, index) => (
          <Flex sx={{ backgroundColor: 'background', p: 2 }} key={index}>
            <Flex sx={{ flexDirection: 'column' }}>
              <Text sx={{ variant: 'text.caps', fontSize: 1 }}>{getNumberWithOrdinal(index + 1)} choice</Text>
              <Text>{poll.options[choice[index]]}</Text>
            </Flex>
            <Close
              ml="auto"
              my="auto"
              sx={{ '> svg': { size: [3] } }}
              onClick={e => handleRemove(e, index)}
            />
          </Flex>
        ))}
        {showListboxInput && (
          <ListboxInput
            defaultValue={choice[numConfirmed] ? choice[numConfirmed].toString() : 'default'}
            key={numConfirmed}
            data-testid="ranked choice"
            onChange={handeListboxInputChange}
          >
            <ListboxButton
              sx={{ variant: 'listboxes.default.button', fontWeight: 400, py: 2 }}
              arrow={<Icon name="chevron_down" size={2} />}
            />
            <ListboxPopover sx={{ variant: 'listboxes.default.popover' }}>
              <ListboxList sx={{ variant: 'listboxes.default.list' }}>
                <ListboxOption data-testid="ranked choice option" value="default" sx={{ display: 'none' }}>
                  {getNumberWithOrdinal(numConfirmed + 1)} choice
                </ListboxOption>
                {map(availableChoices, (label, optionId) => (
                  <ListboxOption
                    data-testid="ranked choice option"
                    key={optionId}
                    value={optionId}
                    sx={{ whiteSpace: 'normal' }}
                  >
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
