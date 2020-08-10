/** @jsx jsx */
import { useState } from 'react';
import { Text, Flex, Button, jsx } from 'theme-ui';
import { Icon } from '@makerdao/dai-ui-icons';
import invariant from 'tiny-invariant';

import { isRankedChoicePoll } from '../../lib/utils';
import Stack from '../layouts/Stack';
import Poll from '../../types/poll';
import useBallotStore from '../../stores/ballot';
import RankedChoiceSelect from './RankedChoiceSelect';
import SingleSelect from './SingleSelect';
import ChoiceSummary from './ChoiceSummary';

const QuickVote = ({
  poll,
  sending,
  showHeader,
  ...props
}: {
  poll: Poll;
  sending: null | string;
  showHeader: boolean;
}) => {
  const [addToBallot, addedChoice] = useBallotStore(state => [state.addToBallot, state.ballot[poll.pollId]]);
  const [choice, setChoice] = useState<number | number[] | null>(addedChoice?.option ?? null);
  const [editing, setEditing] = useState(false);
  const isChoiceValid = Array.isArray(choice) ? choice.length > 0 : choice !== null;

  const submit = () => {
    invariant(isChoiceValid);
    addToBallot(poll.pollId, choice as number | number[]);
    setEditing(false);
  };

  const gap = 3;
  return (
    <Stack gap={gap} {...props}>
      <Flex sx={{ flexDirection: 'row', justifyContent: 'flex-start', display: showHeader ? null : 'none' }}>
        <Text variant="caps" color="mutedAlt">
          Your Vote
        </Text>
        {isRankedChoicePoll(poll) && <Icon name="stackedVotes" size={3} ml={2} />}
      </Flex>

      {!!addedChoice && !editing ? (
        <ChoiceSummary
          sending={sending}
          poll={poll}
          choice={addedChoice}
          edit={() => setEditing(true)}
          showHeader={showHeader}
        />
      ) : (
        <div>
          {isRankedChoicePoll(poll) ? (
            <RankedChoiceSelect {...{ poll, setChoice }} choice={choice as number[] | null} />
          ) : (
            <SingleSelect {...{ poll, setChoice }} choice={choice as number | null} />
          )}
          <Button
            variant={showHeader ? 'primaryOutline' : 'primary'}
            sx={{ width: '100%' }}
            onClick={submit}
            mt={gap}
            disabled={!isChoiceValid}
          >
            Add vote to ballot
          </Button>
        </div>
      )}
    </Stack>
  );
};

export default QuickVote;
