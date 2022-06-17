import { useState, useEffect, useContext } from 'react';
import { Text, Flex, Button, Box, ThemeUIStyleObject } from 'theme-ui';
import { Icon } from '@makerdao/dai-ui-icons';
import invariant from 'tiny-invariant';
import isEqual from 'lodash/isEqual';
import Tooltip from 'modules/app/components/Tooltip';

import { Poll } from 'modules/polling/types';
import { isRankedChoicePoll, extractCurrentPollVote } from 'modules/polling/helpers/utils';
import { useAllUserVotes } from 'modules/polling/hooks/useAllUserVotes';
import Stack from 'modules/app/components/layout/layouts/Stack';
import RankedChoiceSelect from './RankedChoiceSelect';
import SingleSelect from './SingleSelect';
import ChoiceSummary from './ChoiceSummary';
import { useAnalytics } from 'modules/app/client/analytics/useAnalytics';
import { ANALYTICS_PAGES } from 'modules/app/client/analytics/analytics.constants';
import VotingStatus from './PollVotingStatus';
import { useAccount } from 'modules/app/hooks/useAccount';
import { BallotContext } from '../context/BallotContext';

type Props = {
  poll: Poll;
  showHeader: boolean;
  showStatus?: boolean;
  showReviewButton?: boolean;
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

const QuickVote = ({
  poll,
  showHeader,
  showStatus,
  showReviewButton,
  ...props
}: Props): React.ReactElement => {
  const { trackButtonClick } = useAnalytics(ANALYTICS_PAGES.POLLING);
  const { account, voteDelegateContractAddress } = useAccount();
  const { data: allUserVotes } = useAllUserVotes(
    voteDelegateContractAddress ? voteDelegateContractAddress : account
  );

  const { addVoteToBallot, removeVoteFromBallot, ballot, transaction, updateVoteFromBallot } =
    useContext(BallotContext);

  const addedChoice = ballot[poll.pollId];

  const [choice, setChoice] = useState<number | number[] | null>(addedChoice?.option ?? null);
  const [editing, setEditing] = useState(false);
  const isChoiceValid = Array.isArray(choice) ? choice.length > 0 : choice !== null;
  const voteIsPending = !!transaction;
  const currentVote = extractCurrentPollVote(poll, allUserVotes);

  useEffect(() => {
    if (!choice) setChoice(currentVote);
  }, [allUserVotes]);

  useEffect(() => {
    setChoice(null);
  }, [account]);

  useEffect(() => {
    if (addedChoice) {
      setChoice(addedChoice?.option);
    }
  }, [addedChoice]);

  const submit = () => {
    invariant(isChoiceValid);
    if (currentVote && isEqual(currentVote, choice)) {
      removeVoteFromBallot(poll.pollId);
    } else {
      editing
        ? updateVoteFromBallot(poll.pollId, { option: choice as number | number[] })
        : addVoteToBallot(poll.pollId, { option: choice as number | number[] });
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
            <Text variant="caps" color="textSecondary">
              Your Vote
            </Text>
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
          showReviewButton={showReviewButton}
        />
      ) : (
        <div>
          {isRankedChoicePoll(poll) ? (
            <RankedChoiceSelect {...{ poll, setChoice }} choice={choice as number[] | null} />
          ) : (
            <SingleSelect {...{ poll, setChoice }} choice={choice as number | null} />
          )}
          <Button
            data-testid="button-add-vote-to-ballot-desktop"
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
