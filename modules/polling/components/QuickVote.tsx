import { useState, useEffect } from 'react';
import { Text, Flex, Button, Box, ThemeUIStyleObject } from 'theme-ui';
import { Icon } from '@makerdao/dai-ui-icons';
import CustomIcon from 'modules/app/components/Icon';
import invariant from 'tiny-invariant';
import isEqual from 'lodash/isEqual';
import shallow from 'zustand/shallow';
import Tooltip from 'modules/app/components/Tooltip';

import { Poll } from 'modules/polling/types';
import { isRankedChoicePoll, extractCurrentPollVote } from 'modules/polling/helpers/utils';
import { useAllUserVotes } from 'modules/polling/hooks/useAllUserVotes';
import Stack from 'modules/app/components/layout/layouts/Stack';
import { Account } from 'types/account';
import useAccountsStore from 'stores/accounts';
import useBallotStore from 'stores/ballot';
import RankedChoiceSelect from './RankedChoiceSelect';
import SingleSelect from './SingleSelect';
import ChoiceSummary from './ChoiceSummary';
import { useAnalytics } from 'modules/app/client/analytics/useAnalytics';
import { ANALYTICS_PAGES } from 'modules/app/client/analytics/analytics.constants';
import VotingStatus from './PollVotingStatus';

type Props = {
  poll: Poll;
  showHeader: boolean;
  showStatus?: boolean;
  account?: Account;
  sx?: ThemeUIStyleObject;
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

const QuickVote = ({ poll, showHeader, account, showStatus, ...props }: Props): JSX.Element => {
  const { trackButtonClick } = useAnalytics(ANALYTICS_PAGES.POLLING);

  const voteDelegate = useAccountsStore(state => (account ? state.voteDelegate : null));
  const addressToCheck = voteDelegate ? voteDelegate.getVoteDelegateAddress() : account?.address;
  const { data: allUserVotes } = useAllUserVotes(addressToCheck);

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
          justifyContent: 'space-between',
          alignItems: 'center'
        }}
      >
        <Flex
          sx={{
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'flex-start',
            display: showHeader ? undefined : 'none'
          }}
        >
          <Flex sx={{ alignItems: 'center' }}>
            <Text variant="caps" color="textSecondary" mr={2}>
              Your Vote
            </Text>
            <CustomIcon name="vote" />
          </Flex>

          {isRankedChoicePoll(poll) && (
            <Tooltip label={rankedChoiceBlurb}>
              <Box sx={{ position: 'relative' }}>
                {/* Box is used because tooltip needs a child that can be passed a ref */}
                <Icon name="stackedVotes" size={3} ml={2} />
              </Box>
            </Tooltip>
          )}
        </Flex>
        {showStatus && <VotingStatus sx={{ display: ['none', 'block'] }} poll={poll} />}
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
              trackButtonClick('addVoteToBallot');
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
