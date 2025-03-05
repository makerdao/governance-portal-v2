/*

SPDX-FileCopyrightText: © 2023 Dai Foundation <www.daifoundation.org>

SPDX-License-Identifier: AGPL-3.0-or-later

*/

import { useState, useEffect, useContext } from 'react';
import { Icon } from '@makerdao/dai-ui-icons';
import { Text, Button, Box, Flex } from 'theme-ui';
import invariant from 'tiny-invariant';
import range from 'lodash/range';
import isNil from 'lodash/isNil';
import { Poll } from 'modules/polling/types';
import Stack from 'modules/app/components/layout/layouts/Stack';
import { useRouter } from 'next/router';
import VotingStatus from './PollVotingStatus';
import ballotAnimation from 'lib/animation/ballotSuccess.json';
import useSWR from 'swr';
import { fetchJson } from 'lib/fetchJson';
import QuickVote from './poll-vote-input/QuickVote';
import { BallotContext } from '../context/BallotContext';
import { DialogContent, DialogOverlay } from 'modules/app/components/Dialog';
import { fetchSinglePoll } from '../api/fetchPollBy';
import { useNetwork } from 'modules/app/hooks/useNetwork';

enum ViewState {
  START,
  INPUT,
  ADDING,
  NEXT
}

type Props = {
  poll: Poll;
  close?: () => void;
  setPoll?: (poll: Poll) => void;

  editingOnly?: boolean;
  withStart?: boolean;
};
export default function MobileVoteSheet({
  poll,
  setPoll,
  close,
  editingOnly,
  withStart
}: Props): JSX.Element {
  const network = useNetwork();

  const { ballot, ballotCount } = useContext(BallotContext);

  const [viewState, setViewState] = useState<ViewState>(withStart ? ViewState.START : ViewState.INPUT);
  const router = useRouter();
  const onBallot = !isNil(ballot[poll.pollId]?.option);

  const [activePollIds, setActivePollIds] = useState<number[]>([]);
  const { data: pollsData } = useSWR(`/api/polling/v2/active-poll-ids?network=${network}`, fetchJson, {
    refreshInterval: 0,
    revalidateOnFocus: false,
    revalidateOnMount: true
  });

  useEffect(() => {
    if (pollsData) {
      setActivePollIds(pollsData);
    }
  }, [pollsData]);

  const submit = () => {
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

  const goToNextPoll = async () => {
    const nextPollId = activePollIds.find(pollId => !ballot[pollId]);
    const nextPoll = nextPollId ? await fetchSinglePoll(network, nextPollId) : null;

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
          borderColor: 'secondaryMuted',
          px: 3,
          py: '14px',
          backgroundColor: 'surface',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexDirection: 'row',
          zIndex: 1
        }}
      >
        <VotingStatus poll={poll} />
        {onBallot ? (
          <Button
            variant="outline"
            mr={2}
            onClick={() => setViewState(ViewState.INPUT)}
            sx={{
              display: 'flex',
              flexDirection: 'row',
              flexWrap: 'nowrap',
              alignItems: 'center'
            }}
          >
            <Icon name="edit" size={3} mr={2} />
            Edit Choices
          </Button>
        ) : (
          <Button sx={{ width: '110px' }} variant="primary" onClick={() => setViewState(ViewState.INPUT)}>
            Vote
          </Button>
        )}
      </Flex>
    );
  else
    return (
      <DialogOverlay isOpen onDismiss={close ? close : () => setViewState(ViewState.START)}>
        <DialogContent ariaLabel="Vote Form">
          {viewState == ViewState.NEXT ? (
            <Stack gap={2}>
              <Text variant="caps">
                {ballotCount} of {activePollIds.length} available polls added to ballot
              </Text>
              <Flex
                sx={{
                  flexDirection: 'row',
                  flexWrap: 'nowrap',
                  height: 2,
                  my: 2
                }}
              >
                {range(activePollIds.length).map(i => (
                  <Box
                    key={i}
                    sx={{
                      flex: 1,
                      borderLeft: i === 0 ? undefined : '2px solid white',
                      borderTopLeftRadius: i === 0 ? 'small' : undefined,
                      borderBottomLeftRadius: i === 0 ? 'small' : undefined,
                      borderTopRightRadius: i === activePollIds.length - 1 ? 'small' : undefined,
                      borderBottomRightRadius: i === activePollIds.length - 1 ? 'small' : undefined,
                      backgroundColor: i < ballotCount ? 'primary' : 'secondary'
                    }}
                  />
                ))}
              </Flex>
              {pollsData && ballotCount < activePollIds.length && (
                <Button variant="outline" sx={{ py: 3, fontSize: 2 }} onClick={goToNextPoll}>
                  Next Poll
                </Button>
              )}
              <Button
                variant="primaryLarge"
                sx={{ py: 3, fontSize: 2 }}
                onClick={() => router.push({ pathname: '/polling/review' })}
              >
                Review &amp; Submit Ballot
              </Button>
            </Stack>
          ) : (
            <Stack gap={2}>
              <Text variant="microHeading">{poll.title}</Text>
              <Text>{poll.summary}</Text>
              {viewState == ViewState.ADDING ? (
                <AddingView done={() => setViewState(ViewState.NEXT)} />
              ) : (
                <QuickVote poll={poll} onSubmit={submit} buttonVariant="primaryLarge" />
              )}
            </Stack>
          )}
        </DialogContent>
      </DialogOverlay>
    );
}

const AddingView = ({ done }: { done: () => void }) => {
  useEffect(() => {
    const loadLottie = async () => {
      const lottie = await import('lottie-web');
      const animation = lottie.default.loadAnimation({
        container: document.getElementById('ballot-animation-container') as HTMLElement,
        loop: false,
        autoplay: true,
        animationData: ballotAnimation
      });

      animation.addEventListener('complete', () => setTimeout(done, 200));

      return () => {
        animation.destroy();
      };
    };

    loadLottie();
  }, []);

  return (
    <Stack gap={2} sx={{ alignItems: 'center' }}>
      <Box sx={{ height: '160px', width: '100%' }} id="ballot-animation-container" />
    </Stack>
  );
};
