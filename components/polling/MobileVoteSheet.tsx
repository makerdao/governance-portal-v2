/** @jsx jsx */
import { useState, useEffect } from 'react';
import { Icon } from '@makerdao/dai-ui-icons';
import { Text, Button, Box, Flex, jsx } from 'theme-ui';
import invariant from 'tiny-invariant';
import { DialogOverlay, DialogContent } from '@reach/dialog';
import range from 'lodash/range';
import isNil from 'lodash/isNil';
import isEqual from 'lodash/isEqual';
import shallow from 'zustand/shallow';
import lottie from 'lottie-web';
import useSWR from 'swr';

import { Account } from 'types/account';
import { Poll } from 'types/poll';
import { PollVote } from 'types/pollVote';
import useBallotStore from 'stores/ballot';
import { isRankedChoicePoll, extractCurrentPollVote } from 'lib/utils';
import Stack from '../layouts/Stack';
import RankedChoiceSelect from './RankedChoiceSelect';
import SingleSelect from './SingleSelect';
import { useRouter } from 'next/router';
import getMaker, { getNetwork } from 'lib/maker';
import VotingStatus from './PollVotingStatus';
import ballotAnimation from 'lib/animation/ballotSuccess.json';
import { slideUp } from 'lib/keyframes';
import mixpanel from 'mixpanel-browser';

enum ViewState {
  START,
  INPUT,
  ADDING,
  NEXT
}

type Props = {
  account?: Account;
  poll: Poll;
  close?: () => void;
  setPoll?: (poll: Poll) => void;
  ballotCount?: number;
  activePolls?: Poll[];
  editingOnly?: boolean;
  withStart?: boolean;
};
export default function MobileVoteSheet({
  account,
  poll,
  setPoll,
  close,
  ballotCount = 0,
  activePolls = [],
  editingOnly,
  withStart
}: Props): JSX.Element {
  const { data: allUserVotes } = useSWR<PollVote[]>(
    account?.address ? ['/user/voting-for', account.address] : null,
    (_, address) => getMaker().then(maker => maker.service('govPolling').getAllOptionsVotingFor(address)),
    { refreshInterval: 0 }
  );
  const currentVote = extractCurrentPollVote(poll, allUserVotes);
  const [addToBallot, removeFromBallot, ballot] = useBallotStore(
    state => [state.addToBallot, state.removeFromBallot, state.ballot],
    shallow
  );
  const [choice, setChoice] = useState<number | number[] | null>(ballot[poll.pollId]?.option ?? null);
  const isChoiceValid = Array.isArray(choice) ? choice.length > 0 : choice !== null;
  const [viewState, setViewState] = useState<ViewState>(withStart ? ViewState.START : ViewState.INPUT);
  const router = useRouter();
  const network = getNetwork();
  const total = activePolls.length;
  const onBallot = !isNil(ballot[poll.pollId]?.option);

  const submit = () => {
    invariant(isChoiceValid);
    if (currentVote && isEqual(currentVote, choice)) {
      removeFromBallot(poll.pollId);
      addToBallot(poll.pollId, choice as number | number[]);
    } else {
      addToBallot(poll.pollId, choice as number | number[]);
    }
    if (editingOnly) {
      if (close) {
        close();
      } else {
        setViewState(ViewState.START);
      }
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

  if (viewState == ViewState.START)
    return (
      <Flex
        sx={{
          position: 'fixed',
          bottom: '0',
          left: '0',
          width: '100vw',
          mb: 0,
          borderTopLeftRadius: '12px',
          borderTopRightRadius: '12px',
          border: '1px solid',
          borderColor: 'borderGrey',
          px: 3,
          py: '14px',
          backgroundColor: 'white',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexDirection: 'row'
        }}
      >
        <VotingStatus poll={poll} desktopStyle />
        {onBallot ? (
          <Button
            variant="outline"
            mr={2}
            onClick={() => setViewState(ViewState.INPUT)}
            sx={{
              display: 'flex',
              flexDirection: 'row',
              flexWrap: 'nowrap',
              alignItems: 'center',
              borderRadius: 'small'
            }}
          >
            <Icon name="edit" size={3} mr={2} />
            Edit Choices
          </Button>
        ) : (
          <Button
            sx={{ width: '110px', borderRadius: 'small' }}
            variant="primary"
            onClick={() => setViewState(ViewState.INPUT)}
          >
            Vote
          </Button>
        )}
      </Flex>
    );
  else
    return (
      <DialogOverlay
        sx={{ background: 'hsla(237.4%, 13.8%, 32.7%, 0.9)' }}
        onDismiss={close ? close : () => setViewState(ViewState.START)}
      >
        <DialogContent
          sx={{ variant: 'dialog.mobile', animation: `${slideUp} 350ms ease` }}
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
                  height: 2,
                  my: 2
                }}
              >
                {range(total).map(i => (
                  <Box
                    key={i}
                    sx={{
                      flex: 1,
                      borderLeft: i === 0 ? undefined : '2px solid white',
                      borderTopLeftRadius: i === 0 ? 'small' : undefined,
                      borderBottomLeftRadius: i === 0 ? 'small' : undefined,
                      borderTopRightRadius: i === total - 1 ? 'small' : undefined,
                      borderBottomRightRadius: i === total - 1 ? 'small' : undefined,
                      backgroundColor: i < ballotCount ? 'primary' : 'muted'
                    }}
                  />
                ))}
              </Flex>
              {ballotCount < total && (
                <Button
                  variant="outline"
                  sx={{ py: 3, fontSize: 2, borderRadius: 'small' }}
                  onClick={goToNextPoll}
                >
                  Next Poll
                </Button>
              )}
              <Button
                variant="primaryLarge"
                sx={{ py: 3, fontSize: 2, borderRadius: 'small' }}
                onClick={() => router.push({ pathname: '/polling/review', query: network })}
              >
                Review &amp; Submit Ballot
              </Button>
            </Stack>
          ) : (
            <Stack gap={2}>
              <Text variant="microHeading">{poll.title}</Text>
              <Text sx={{ fontSize: [2, 3] }}>{poll.summary}</Text>
              {viewState == ViewState.ADDING ? (
                <AddingView done={() => setViewState(ViewState.NEXT)} />
              ) : isRankedChoicePoll(poll) ? (
                <RankedChoiceSelect {...{ poll, setChoice }} choice={choice as number[] | null} />
              ) : (
                <SingleSelect {...{ poll, setChoice }} choice={choice as number | null} />
              )}
              <Button
                variant="primaryLarge"
                sx={{ py: 3, fontSize: 2, borderRadius: 'small' }}
                onClick={() => {
                  mixpanel.track('btn-click', {
                    id: 'addVoteToBallot',
                    product: 'governance-portal-v2',
                    page: 'Polling'
                  });
                  submit();
                }}
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
