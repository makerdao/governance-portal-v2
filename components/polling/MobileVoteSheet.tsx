/** @jsx jsx */
import { Text, Button, jsx } from 'theme-ui';
import Poll from '../../types/poll';
import useBallotStore from '../../stores/ballot';
import { useState } from 'react';
import invariant from 'tiny-invariant';
import { DialogOverlay, DialogContent } from '@reach/dialog';
import { isRankedChoicePoll } from '../../lib/utils';
import Stack from '../layouts/Stack';
import RankedChoiceSelect from './RankedChoiceSelect';
import SingleSelect from './SingleSelect';

export default function MobileVoteSheet({ poll, close }: { poll: Poll; close: () => void }): JSX.Element {
  const addToBallot = useBallotStore(state => state.addToBallot);
  const [choice, setChoice] = useState<number | number[] | null>(null);
  const isChoiceValid = Array.isArray(choice) ? choice.length > 0 : choice !== null;

  const submit = () => {
    invariant(isChoiceValid);
    addToBallot(poll.pollId, choice as number | number[]);
  };

  return (
    <DialogOverlay onDismiss={close}>
      <DialogContent
        sx={{
          width: '100vw',
          position: 'absolute',
          bottom: 0,
          mb: 0,
          borderTopLeftRadius: '12px',
          borderTopRightRadius: '12px'
        }}
        aria-label="Vote Form"
      >
        <Stack gap={2}>
          <Text variant="subheading">{poll.title}</Text>
          <Text sx={{ fontSize: [2, 3], opacity: 0.8 }}>{poll.summary}</Text>
          {isRankedChoicePoll(poll) ? (
            <RankedChoiceSelect {...{ poll, setChoice }} />
          ) : (
            <SingleSelect {...{ poll, setChoice }} />
          )}
          <Button variant="primary" onClick={submit} disabled={!isChoiceValid}>
            Add vote to ballot
          </Button>
        </Stack>
      </DialogContent>
    </DialogOverlay>
  );
}
