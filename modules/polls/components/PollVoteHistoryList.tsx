/** @jsx jsx */
import { PollVoteHistory } from 'modules/polls/types/pollVoteHistory';
import { Box, Text, jsx } from 'theme-ui';
import { PollVoteHistoryItem } from './PollVoteHistoryItem';


export function PollVoteHistoryList({ votes }: { votes: PollVoteHistory[] }): React.ReactElement {
  const styles = {
    voteWrapper: {
      marginTop: 3,
      paddingBottom: 3,
      marginBottom: 3,
      borderBottom: '1px solid grey'
    }
  };

  return (
    <Box>
      {
        votes.length > 0 && votes.map(vote => <Box key={vote.pollId} sx={styles.voteWrapper}>
          <PollVoteHistoryItem vote={vote} />
        </Box>)
      }
      {votes.length === 0 && <Box mt={1}>
        <Text>This address has never voted</Text>
      </Box>}
    </Box>
  );
}