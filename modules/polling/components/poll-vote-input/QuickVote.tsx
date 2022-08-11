import { useState, useEffect, useContext } from 'react';
import { Text, Flex, Button } from 'theme-ui';
import invariant from 'tiny-invariant';
import isEqual from 'lodash/isEqual';

import { Poll } from 'modules/polling/types';
import {
  extractCurrentPollVote,
  isInputFormatChooseFree,
  isInputFormatRankFree,
  isInputFormatSingleChoice
} from 'modules/polling/helpers/utils';
import { useAllUserVotes } from 'modules/polling/hooks/useAllUserVotes';
import Stack from 'modules/app/components/layout/layouts/Stack';
import RankedChoiceSelect from './RankedChoiceSelect';
import SingleSelect from './SingleSelect';
import ChoiceSummary from '../ChoiceSummary';
import { useAnalytics } from 'modules/app/client/analytics/useAnalytics';
import { ANALYTICS_PAGES } from 'modules/app/client/analytics/analytics.constants';
import VotingStatus from '../PollVotingStatus';
import { useAccount } from 'modules/app/hooks/useAccount';
import { BallotContext } from '../../context/BallotContext';
import ChooseFreeSelect from './ChooseFreeSelect';
import { useMKRVotingWeight } from 'modules/mkr/hooks/useMKRVotingWeight';
import { useBreakpointIndex } from '@theme-ui/match-media';

type Props = {
  poll: Poll;
  showHeader: boolean;
  showStatus?: boolean;
  showReviewButton?: boolean;
  onSubmit?: () => void;
  buttonVariant?: string;
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
  onSubmit,
  buttonVariant
}: Props): React.ReactElement => {
  const { trackButtonClick } = useAnalytics(ANALYTICS_PAGES.POLLING);
  const { account, voteDelegateContractAddress } = useAccount();
  const { data: votingWeight } = useMKRVotingWeight(account);
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
    if (onSubmit) {
      onSubmit();
    }
  };

  return (
    <Stack gap={2}>
      <Flex
        sx={{
          justifyContent: 'space-between',
          alignItems: 'flex-end',
          flexDirection: 'row'
        }}
      >
        <Text variant="caps">Your vote</Text>
        {showStatus && <VotingStatus poll={poll} />}
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
          {isInputFormatRankFree(poll.parameters) && (
            <RankedChoiceSelect poll={poll} setChoice={setChoice} choice={choice as number[] | null} />
          )}
          {isInputFormatSingleChoice(poll.parameters) && (
            <SingleSelect poll={poll} setChoice={setChoice} choice={choice as number | null} />
          )}
          {isInputFormatChooseFree(poll.parameters) && (
            <ChooseFreeSelect poll={poll} setChoice={setChoice} choice={choice as number[] | null} />
          )}
          <Button
            data-testid="button-add-vote-to-ballot"
            variant={buttonVariant ? buttonVariant : 'primary'}
            sx={{ width: '100%', mt: 3 }}
            onClick={() => {
              trackButtonClick('addVoteToBallot');
              submit();
            }}
            mt={2}
            disabled={!isChoiceValid || !votingWeight || !votingWeight.total.gt(0)}
          >
            {!votingWeight || !votingWeight.total.gt(0)
              ? 'Deposit MKR to vote'
              : editing
              ? 'Update vote'
              : 'Add vote to ballot'}
          </Button>
        </div>
      )}
    </Stack>
  );
};

export default QuickVote;
