/** @jsx jsx */
import { useState, useEffect } from 'react';
import { Text, Flex, Button, Box, jsx } from 'theme-ui';
import { Icon } from '@makerdao/dai-ui-icons';
import invariant from 'tiny-invariant';
import isEqual from 'lodash/isEqual';
import shallow from 'zustand/shallow';
import Tooltip from '../Tooltip';
import useSWR from 'swr';

import getMaker from '../../lib/maker';
import PollVote from '../../types/pollVote';
import { isRankedChoicePoll, extractCurrentPollVote } from '../../lib/utils';
import Stack from '../layouts/Stack';
import Poll from '../../types/poll';
import Account from '../../types/account';
import useBallotStore from '../../stores/ballot';
import RankedChoiceSelect from './RankedChoiceSelect';
import SingleSelect from './SingleSelect';
import ChoiceSummary from './ChoiceSummary';
import mixpanel from 'mixpanel-browser';

type Props = {
  poll: Poll;
  showHeader: boolean;
  account?: Account;
};

const rankedChoiceBlurb = (
  <>
    Voters can rank options in order of preference. <br />
    If no option receives more than 50% of the vote <br />
    based on first choices, the option with the fewest <br />
    votes is eliminated and its votes are redistributed <br />
    to their voters&apos; second choices until one option <br />
    achieves a majority.
  </>
);

const QuickVote = ({ poll, showHeader, account, ...props }: Props): JSX.Element => {
  const { data: allUserVotes } = useSWR<PollVote[]>(
    account?.address ? ['/user/voting-for', account.address] : null,
    (_, address) => getMaker().then(maker => maker.service('govPolling').getAllOptionsVotingFor(address)),
    { refreshInterval: 0 }
  );

  const [addToBallot, addedChoice, removeFromBallot, txId] = useBallotStore(
    state => [state.addToBallot, state.ballot[poll.pollId], state.removeFromBallot, state.txId],
    shallow
  );
  const [choice, setChoice] = useState<number | number[] | null>(addedChoice?.option ?? null);
  const [editing, setEditing] = useState(false);
  const isChoiceValid = Array.isArray(choice) ? choice.length > 0 : choice !== null;
  const voteIsPending = txId !== null;
  const currentVote = extractCurrentPollVote(poll, allUserVotes);

  useEffect(() => {
    if (!choice) setChoice(currentVote);
  }, [allUserVotes]);

  const submit = () => {
    invariant(isChoiceValid);
    if (currentVote && isEqual(currentVote, choice)) {
      removeFromBallot(poll.pollId);
    } else {
      addToBallot(poll.pollId, choice as number | number[]);
    }
    setEditing(false);
  };

  const gap = 2;
  return (
    <Stack gap={gap} {...props}>
      <Flex
        sx={{
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'flex-start',
          display: showHeader ? undefined : 'none'
        }}
      >
        <Text variant="caps" color="textSecondary">
          Your Vote
        </Text>
        {isRankedChoicePoll(poll) && (
          <Tooltip label={rankedChoiceBlurb}>
            <Box sx={{ position: 'relative' }}>
              {/* Box is used because tooltip needs a child that can be passed a ref */}
              <Icon name="stackedVotes" size={3} ml={2} />
            </Box>
          </Tooltip>
        )}
      </Flex>

      {(!!addedChoice || currentVote !== null) && !editing ? (
        <ChoiceSummary
          voteIsPending={voteIsPending}
          poll={poll}
          choice={addedChoice?.option ?? currentVote}
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
            onClick={() => {
              mixpanel.track('btn-click', {
                id: 'addVoteToBallot',
                product: 'governance-portal-v2',
                page: 'Polling'
              });
              submit();
            }}
            mt={gap}
            disabled={!isChoiceValid}
          >
            {editing ? 'Update vote' : 'Add vote to ballot'}
          </Button>
        </div>
      )}
    </Stack>
  );
};

export default QuickVote;
