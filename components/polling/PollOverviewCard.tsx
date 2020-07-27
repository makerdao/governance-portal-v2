/** @jsx jsx */
import Link from 'next/link';
import { useState, useMemo, useEffect } from 'react';
import { Text, Flex, Box, Button, jsx } from 'theme-ui';
import { Icon } from '@makerdao/dai-ui-icons';
import { ListboxInput, ListboxButton, ListboxPopover, ListboxList, ListboxOption } from '@reach/listbox';
import map from 'lodash/map';
import omitBy from 'lodash/omitBy';
import { isActivePoll, isRankedChoicePoll, getNumberWithOrdinal } from '../../lib/utils';
import { getNetwork } from '../../lib/maker';
import Stack from '../layouts/Stack';
import CountdownTimer from '../CountdownTimer';
import VotingStatus from './VotingStatus';
import Poll from '../../types/poll';
import PollOptionBadge from '../PollOptionBadge';
import { useBreakpoints } from '../../lib/useBreakpoints';
import useAccountsStore from '../../stores/accounts';
import useBallotStore from '../../stores/ballot';

const PollOverviewCard = ({ poll, ...props }: { poll: Poll }) => {
  const network = getNetwork();
  const account = useAccountsStore(state => state.currentAccount);
  const bpi = useBreakpoints();
  const showQuickVote = !!account && bpi > 0 && isActivePoll(poll);

  return (
    <Flex sx={{ flexDirection: 'row', justifyContent: 'space-between', variant: 'cards.primary' }} {...props}>
      <Stack gap={2}>
        {bpi === 0 && (
          <Flex sx={{ justifyContent: 'space-between', flexDirection: 'row' }}>
            <CountdownTimer endText="Poll ended" endDate={poll.endDate} />
            <VotingStatus poll={poll} />
          </Flex>
        )}
        <Link
          href={{ pathname: '/polling/[poll-hash]', query: { network } }}
          as={{ pathname: `/polling/${poll.slug}`, query: { network } }}
        >
          <Text sx={{ fontSize: [3, 4], whiteSpace: 'nowrap', overflowX: 'auto' }}>{poll.title}</Text>
        </Link>
        <Text
          sx={{
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            fontSize: [2, 3],
            opacity: 0.8
          }}
        >
          {poll.summary}
        </Text>
        {bpi > 0 && <CountdownTimer endText="Poll ended" endDate={poll.endDate} />}
        <Flex sx={{ alignItems: 'center' }}>
          <Link
            key={poll.slug}
            href={{ pathname: '/polling/[poll-hash]', query: { network } }}
            as={{ pathname: `/polling/${poll.slug}`, query: { network } }}
          >
            <Button variant={isActivePoll(poll) ? 'primary' : 'outline'}>View Details</Button>
          </Link>
          {isActivePoll(poll) ? '' : <PollOptionBadge poll={poll} sx={{ color: 'mutedAlt' }} />}
          <VotingStatus sx={{ display: ['none', 'block'] }} poll={poll} />
        </Flex>
      </Stack>
      {showQuickVote && <QuickVote poll={poll} />}
    </Flex>
  );
};

const QuickVote = ({ poll }: { poll: Poll }) => {
  const [addToBallot, addedChoice] = useBallotStore(state => [state.addToBallot, state.ballot[poll.pollId]]);
  const [choice, setChoice] = useState<number | number[] | null>(null);
  const [editing, setEditing] = useState(false);
  // TODO disable button if no option chosen

  const submit = () => {
    if (choice == null) return;
    addToBallot(poll.pollId, choice);
    setEditing(false);
  };

  // TODO show icon next to Your Vote for ranked choice
  const gap = 2;
  return (
    <Stack gap={gap} ml={5} sx={{ maxWidth: 7 }}>
      <Text variant="caps" color="mutedAlt">
        Your Vote
      </Text>
      {!!addedChoice && !editing ? (
        <ChoiceSummary poll={poll} choice={addedChoice} edit={() => setEditing(true)} />
      ) : (
        <div>
          {isRankedChoicePoll(poll) ? (
            <RankedChoiceSelect poll={poll} onChange={setChoice} />
          ) : (
            <SingleSelect {...{ poll, setChoice }} />
          )}
          <Button variant="primaryOutline" onClick={submit} mt={gap}>
            Add vote to ballot
          </Button>
        </div>
      )}
    </Stack>
  );
};

const SingleSelect = ({ poll, setChoice }) => {
  return (
    <ListboxInput onChange={x => setChoice(parseInt(x))}>
      <ListboxButton
        sx={{ variant: 'buttons.outline', width: '100%' }}
        arrow={<Icon name="chevron_down" size={2} />}
      />
      <ListboxPopover
        sx={{
          variant: 'cards.tight',
          '&:focus-within': { outline: 'none' }
        }}
      >
        <ListboxList
          sx={{
            'li[aria-selected="true"]': { backgroundColor: 'primary' }
          }}
        >
          <ListboxOption value="default">Your choice</ListboxOption>
          {map(poll.options, (label, id) => (
            <ListboxOption key={id} value={id}>{label}</ListboxOption>
          ))}
        </ListboxList>
      </ListboxPopover>
    </ListboxInput>
  );
};

const RankedChoiceSelect = ({ poll, onChange }: { poll: Poll; onChange?: (choices: number[]) => void }) => {
  const [selectedChoices, setSelectedChoices] = useState<number[]>([]);
  const [choiceNum, setChoiceNum] = useState<number>(1);
  const numOptions = Object.keys(poll.options).length;

  const availableChoices = useMemo(
    () =>
      omitBy(poll.options, (_, pollId) => {
        return selectedChoices.findIndex(choice => choice === parseInt(pollId)) > -1;
      }),
    [choiceNum]
  );

  const updateSelection = newChoices => {
    setSelectedChoices(newChoices);
    if (onChange) onChange(newChoices);
  };

  return (
    <Box>
      <Stack gap={2}>
        {Array.from({ length: choiceNum - 1 }).map((_, i) => (
          <Flex sx={{ backgroundColor: 'muted', flexDirection: 'column', py: 1, px: 2 }}>
            <Text sx={{ textTransform: 'uppercase', fontSize: 1, fontWeight: 'bold' }}>
              {getNumberWithOrdinal(i + 1)} choice
            </Text>
            <Text>{poll.options[selectedChoices[i]]}</Text>
          </Flex>
        ))}
        <ListboxInput
          key={choiceNum}
          onChange={value => {
            if (value === 'default') {
              updateSelection(selectedChoices.slice(0, -1));
            } else {
              const _selectedChoices = [...selectedChoices];
              _selectedChoices[choiceNum - 1] = parseInt(value);
              updateSelection(_selectedChoices);
            }
          }}
        >
          <ListboxButton
            sx={{ variant: 'buttons.outline', width: '100%' }}
            arrow={<Icon name="chevron_down" size={2} />}
          />
          <ListboxPopover
            sx={{
              variant: 'cards.tight',
              '&:focus-within': { outline: 'none' }
            }}
          >
            <ListboxList
              sx={{
                'li[aria-selected="true"]': { backgroundColor: 'primary' }
              }}
            >
              <ListboxOption value="default">
                {getNumberWithOrdinal(selectedChoices.length + 1)} choice
              </ListboxOption>
              {map(availableChoices, (label, pollId) => (
                <ListboxOption key={pollId} value={pollId}>{label}</ListboxOption>
              ))}
            </ListboxList>
          </ListboxPopover>
        </ListboxInput>
      </Stack>
      {numOptions > choiceNum && selectedChoices[choiceNum - 1] !== undefined && (
        <Text
          color="primary"
          onClick={() => setChoiceNum(choiceNum + 1)}
          sx={{
            pt: 1,
            fontSize: 2,
            cursor: 'pointer',
            textTransform: 'uppercase'
          }}
        >
          + Add another choice
        </Text>
      )}
    </Box>
  );
};

const ChoiceSummary = ({ choice: { option }, poll, edit }) => {
  if (typeof option === 'number') {
    return (
      <Box>
        <Box p={3} bg="background" mb={2}>{poll.options[option]}</Box>
        <Button
          onClick={edit}
          variant="smallOutline"
          sx={{ display: 'inline-flex', flexDirection: 'row', alignItems: 'center' }}
        >
          <Icon name="edit" size={3} mr={1} />
          Edit choice
        </Button>
      </Box>
    );
  }

  // TODO ranked choice
  return null;
};

export default PollOverviewCard;
