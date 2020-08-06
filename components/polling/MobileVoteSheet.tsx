/** @jsx jsx */
import { Text, Button, jsx, Box, Flex } from 'theme-ui';
import Poll from '../../types/poll';
import useBallotStore from '../../stores/ballot';
import { useState, useEffect } from 'react';
import invariant from 'tiny-invariant';
import { DialogOverlay, DialogContent } from '@reach/dialog';
import { isRankedChoicePoll } from '../../lib/utils';
import Stack from '../layouts/Stack';
import RankedChoiceSelect from './RankedChoiceSelect';
import SingleSelect from './SingleSelect';
import range from 'lodash/range';
import { useRouter } from 'next/router';
import { getNetwork } from '../../lib/maker';
import shallow from 'zustand/shallow';
import lottie from 'lottie-web';
import ballotAnimation from './ballotAnimation.json';

enum ViewState {
  INPUT,
  ADDING,
  NEXT
}

type Props = {
  poll: Poll;
  close: () => void;
  setPoll?: (poll: Poll) => void;
  ballotCount?: number;
  activePolls?: Poll[];
  editingOnly?: boolean;
};
export default function MobileVoteSheet({
  poll,
  setPoll,
  close,
  ballotCount = 0,
  activePolls = [],
  editingOnly
}: Props): JSX.Element {
  const [addToBallot, ballot] = useBallotStore(state => [state.addToBallot, state.ballot], shallow);
  const [choice, setChoice] = useState<number | number[] | null>(ballot[poll.pollId]?.option ?? null);
  const isChoiceValid = Array.isArray(choice) ? choice.length > 0 : choice !== null;
  const [viewState, setViewState] = useState<ViewState>(ViewState.INPUT);
  const router = useRouter();
  const network = getNetwork();
  const total = activePolls.length;

  const submit = () => {
    invariant(isChoiceValid);
    addToBallot(poll.pollId, choice as number | number[]);
    if (editingOnly) {
      close();
    } else {
      setViewState(ViewState.ADDING);
    }
  };

  const goToNextPoll = () => {
    setChoice(null);
    const nextPoll = activePolls.find(p => !ballot[p.pollId]);
    invariant(nextPoll && setPoll);
    setPoll(nextPoll);
    setViewState(ViewState.INPUT);
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
          borderTopRightRadius: '12px',
          px: 3,
          py: 4
        }}
        aria-label="Vote Form"
      >
        {viewState == ViewState.NEXT ? (
          <Stack gap={2}>
            <Text variant="caps">
              {ballotCount} of {total} available polls added to ballot
            </Text>
            <Flex
              sx={{
                flexDirection: 'row',
                flexWrap: 'nowrap',
                height: '4px',
                my: 2
              }}
            >
              {range(total).map(i => (
                <Box
                  key={i}
                  sx={{
                    flex: 1,
                    borderLeft: i === 0 ? null : '2px solid white',
                    borderTopLeftRadius: i === 0 ? 'small' : null,
                    borderBottomLeftRadius: i === 0 ? 'small' : null,
                    borderTopRightRadius: i === total - 1 ? 'small' : null,
                    borderBottomRightRadius: i === total - 1 ? 'small' : null,
                    backgroundColor: i < ballotCount ? 'primary' : 'muted'
                  }}
                />
              ))}
            </Flex>
            {ballotCount < total && (
              <Button variant="outline" onClick={goToNextPoll}>
                Next Poll
              </Button>
            )}
            <Button
              variant="primary"
              onClick={() => router.push({ pathname: '/polling/review', query: network })}
            >
              Review &amp; Submit Ballot
            </Button>
          </Stack>
        ) : (
          <Stack gap={2}>
            <Text variant="subheading">{poll.title}</Text>
            <Text sx={{ fontSize: [2, 3], opacity: 0.8 }}>{poll.summary}</Text>
            {viewState == ViewState.ADDING ? (
              <AddingView done={() => setViewState(ViewState.NEXT)} />
            ) : isRankedChoicePoll(poll) ? (
              <RankedChoiceSelect {...{ poll, setChoice }} choice={choice as number[] | null} />
            ) : (
              <SingleSelect {...{ poll, setChoice }} choice={choice as number | null} />
            )}
            <Button
              variant="primary"
              onClick={submit}
              disabled={!isChoiceValid || viewState == ViewState.ADDING}
            >
              {editingOnly ? 'Update vote' : 'Add vote to ballot'}
            </Button>
          </Stack>
        )}
      </DialogContent>
    </DialogOverlay>
  );
}

const AddingView = ({ done }: { done: () => void }) => {
  useEffect(() => {
    const animation = lottie.loadAnimation({
      container: document.getElementById('ballot-animation-container') as HTMLElement,
      loop: false,
      autoplay: true,
      animationData: ballotAnimation
    });

    animation.addEventListener('complete', () => setTimeout(done, 200));
  }, []);

  return (
    <Stack gap={2} sx={{ alignItems: 'center' }}>
      <div sx={{ height: '160px', width: '100%' }} id="ballot-animation-container" />
    </Stack>
  );
};
