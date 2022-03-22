import { getNumberWithOrdinal } from 'lib/utils';
import { useAccount } from 'modules/app/hooks/useAccount';
import { Box, Button, Flex, Text } from 'theme-ui';
import { getVoteColor } from '../helpers/getVoteColor';
import { extractCurrentPollVote } from '../helpers/utils';
import { useAllUserVotes } from '../hooks/useAllUserVotes';
import { POLL_VOTE_TYPE } from '../polling.constants';

export default function PollVotedOption({ poll }) {
    const { account, voteDelegateContractAddress } = useAccount();
  const { data: allUserVotes } = useAllUserVotes(
    voteDelegateContractAddress ? voteDelegateContractAddress : account
  );

  const currentVote = extractCurrentPollVote(poll, allUserVotes);



  return (
    <Box>
      <Box>
        <Text variant="caps" color="textSecondary">
          Your voted option
        </Text>
        {poll.voteType === POLL_VOTE_TYPE.PLURALITY_VOTE ? (
          <Text sx={{
            color: getVoteColor(currentVote as number, poll.voteType),
            fontWeight: 'semiBold'
          }}>{poll.options[currentVote as number]}</Text>
        ): (currentVote as number[]).map((id, index) => (
            <Flex sx={{ backgroundColor: 'background', py: 2, px: 3, mb: 2 }} key={id}>
              <Flex sx={{ flexDirection: 'column' }}>
                <Text sx={{ variant: 'text.caps', fontSize: 1 }}>{getNumberWithOrdinal(index + 1)} choice</Text>
                <Text data-testid="choice">{poll.options[id]}</Text>
              </Flex>
            </Flex>
          ))}
        
        <Button variant="primaryOutline" sx={{ width: '100%' }} mb={2}>
          Share on twitter
        </Button>
        <Button variant="primaryOutline" sx={{ width: '100%' }} mb={2}>
          Share on the forum
        </Button>
      </Box>
    </Box>
  );
}

