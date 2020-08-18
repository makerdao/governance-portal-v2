/** @jsx jsx */
import { useState, useEffect } from 'react';
import { Text, Flex, Button, Box, jsx } from 'theme-ui';
import { Icon } from '@makerdao/dai-ui-icons';
import invariant from 'tiny-invariant';
import shallow from 'zustand/shallow';
import Tooltip from '@reach/tooltip';
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

type Props = {
  poll: Poll;
  showHeader: boolean;
  account?: Account;
};

const QuickVote = ({ poll, showHeader, account, ...props }: Props) => {
  const { data: allUserVotes } = useSWR<PollVote[]>(
    account?.address ? ['/user/voting-for', account.address] : null,
    (_, address) => getMaker().then(maker => maker.service('govPolling').getAllOptionsVotingFor(address)),
    { refreshInterval: 0 }
  );

  const [addToBallot, addedChoice, txId] = useBallotStore(
    state => [state.addToBallot, state.ballot[poll.pollId], state.txId],
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

  // console.log(addedChoice, currentVote, 'addedChoice');

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
