import { Box, Text, Flex } from 'theme-ui';
import isEqual from 'lodash/isEqual';

import { Poll } from 'modules/polling/types';
import { isActivePoll, findPollById } from 'modules/polling/helpers/utils';
import { useAllUserVotes } from 'modules/polling/hooks/useAllUserVotes';
import { useAccount } from 'modules/app/hooks/useAccount';
import { useContext } from 'react';
import { BallotContext } from '../context/BallotContext';

type Props = { polls: Poll[]; activePolls: Poll[]; voted?: boolean };

export default function BallotPollBar({ polls, activePolls, voted, ...props }: Props): JSX.Element {
  const { account, voteDelegateContractAddress } = useAccount();
  const { ballot, ballotCount, previousBallot } = useContext(BallotContext);
  const { data: allUserVotes } = useAllUserVotes(
    voteDelegateContractAddress ? voteDelegateContractAddress : account
  );

  const ballotToPick = voted ? previousBallot : ballot;
  const ballotLength = voted ? Object.keys(previousBallot).length : ballotCount;

  const allUserPolls: Poll[] = allUserVotes
    ? allUserVotes
        .map(vote => findPollById(polls, vote.pollId.toString()))
        .filter((vote): vote is Poll => Boolean(vote))
    : [];

  const allUserVotesActive = allUserPolls.filter(poll => isActivePoll(poll));
  const availablePollsLength = activePolls.length - allUserVotesActive.length;

  const edits = Object.keys(ballotToPick).filter(pollId => {
    const existingVote = allUserVotes?.find(vote => vote.pollId === parseInt(pollId));
    if (existingVote) {
      return existingVote.ballot
        ? !isEqual(existingVote.ballot, ballotToPick[pollId].option)
        : !isEqual(existingVote.optionId, ballotToPick[pollId].option);
    }
    return false;
  }).length;

  return availablePollsLength > 0 || edits > 0 ? (
    <Box p={3} sx={{ borderBottom: '1px solid secondaryMuted' }} {...props}>
      <Text sx={{ color: 'textSecondary', fontSize: 3 }}>
        {voted
          ? `You voted on ${ballotLength} poll${ballotLength > 1 ? 's' : ''}`
          : `${ballotLength - edits} of ${availablePollsLength} available poll${
              availablePollsLength > 1 ? 's' : ''
            } added to ballot`}
      </Text>
      <Flex
        sx={{
          width: '100%',
          height: 2,
          backgroundColor: 'secondary',
          mt: 2,
          flexDirection: 'row',
          borderRadius: 'small'
        }}
      >
        {Array(availablePollsLength)
          .fill(null)
          .map((_, index) => (
            <Box
              key={index}
              backgroundColor="secondary"
              sx={{
                flex: 1,
                borderLeft: index === 0 ? undefined : '1px solid white',
                borderTopLeftRadius: index === 0 ? 'small' : undefined,
                borderBottomLeftRadius: index === 0 ? 'small' : undefined,
                borderTopRightRadius: index === availablePollsLength - 1 ? 'small' : undefined,
                borderBottomRightRadius: index === availablePollsLength - 1 ? 'small' : undefined,
                backgroundColor: index < (voted ? ballotLength : ballotLength - edits) ? 'primary' : undefined
              }}
            />
          ))}
      </Flex>
      {edits > 0 && !voted && (
        <Box mt={2} mb={-2}>
          <Text sx={{ color: 'textSecondary' }}>
            <Text as="span" sx={{ color: 'text', fontWeight: 'bold' }}>
              and {edits}
            </Text>{' '}
            vote edit
            {edits > 1 && 's'} added to ballot.
          </Text>
        </Box>
      )}
    </Box>
  ) : (
    <Box pt={3} px={3} pb={2} sx={{ color: 'primary' }}>
      All polls complete
    </Box>
  );
}
