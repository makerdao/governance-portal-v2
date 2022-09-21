import { PollVoteHistory } from 'modules/polling/types/pollVoteHistory';
import { useState } from 'react';
import { Box, Text, Divider } from 'theme-ui';
import { hasVictoryConditionPlurality } from '../helpers/utils';
import { PollVoteHistoryItem } from './PollVoteHistoryItem';

export function PollVoteHistoryList({ votes }: { votes: PollVoteHistory[] }): React.ReactElement {
  const styles = {
    voteWrapper: {
      marginTop: 3,
      paddingBottom: 3,
      marginBottom: 3,
      borderBottom: '1px solid',
      borderColor: 'secondary',
      ':last-child': {
        border: 'none'
      }
    }
  };
  const [showAllVotes, setShowAllVotes] = useState(votes.length <= 5);
  const votesToShow = showAllVotes ? votes : votes.slice(0, 5);
  const showDivider =
    votes.filter(vote => hasVictoryConditionPlurality(vote.poll.parameters.victoryConditions)).length > 0;

  return (
    <Box>
      {votes.length > 0 ? (
        <Box>
          <Box
            sx={{
              pl: [3, 4],
              pr: [3, 4]
            }}
          >
            {votesToShow.map(vote => (
              <Box key={vote.pollId} sx={styles.voteWrapper}>
                <PollVoteHistoryItem vote={vote} />
              </Box>
            ))}
          </Box>

          {!showAllVotes && (
            <Box sx={{ cursor: 'pointer' }} onClick={() => setShowAllVotes(true)}>
              <Divider />
              <Text as="p" sx={{ textAlign: 'center', color: 'textSecondary', p: [2] }}>
                View more polling proposals ({votes.length - votesToShow.length})
              </Text>
              <Divider />
            </Box>
          )}
          {showAllVotes && showDivider && <Divider mt={3} mb={1} />}
        </Box>
      ) : (
        <Box p={[3, 4]} mt={1}>
          <Text>No polling vote history found</Text>
        </Box>
      )}
    </Box>
  );
}
