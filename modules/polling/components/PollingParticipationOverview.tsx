/** @jsx jsx */

import { Box, Text, jsx } from 'theme-ui';
import BigNumber from 'bignumber.js';
import { PollVoteHistory } from '../types/pollVoteHistory';
import { POLL_VOTE_TYPE } from '../polling.constants';

export function PollingParticipationOverview({ votes }: { votes: PollVoteHistory[] }): React.ReactElement {
  const filteredVotes = votes.filter(i => i.poll.voteType === POLL_VOTE_TYPE.PLURALITY_VOTE);
  const total = filteredVotes.length;

  const votedYes = new BigNumber(filteredVotes.filter(vote => vote.option === 1).length);
  const votedNo = new BigNumber(filteredVotes.filter(vote => vote.option === 2).length);
  const votedAbstain = new BigNumber(filteredVotes.filter(vote => vote.option === 0).length);

  const yesPercent = votedYes.dividedBy(total).multipliedBy(100).toFixed(0);
  const abstainPercent = votedAbstain.dividedBy(total).multipliedBy(100).toFixed(0);
  const noPercent = votedNo.dividedBy(total).multipliedBy(100).toFixed(0);

  const styles = {
    titles: {
      display: 'flex',
      justifyContent: 'space-between'
    },
    progressBarWrapper: {
      display: 'flex',
      borderRadius: '4px',
      overflow: 'hidden',
      marginTop: 2,
      marginBottom: 2
    },
    yesBar: {
      backgroundColor: 'primary',
      height: '4px',
      width: `${yesPercent}%`
    },
    noBar: {
      backgroundColor: 'notice',
      height: '4px',
      width: `${noPercent}%`
    },
    abstainBar: {
      backgroundColor: 'secondary',
      height: '4px',
      width: `${abstainPercent}%`
    },
    percentagesWrapper: {
      display: 'flex',
      justifyContent: 'space-between',
      mt: 1
    },
    yesPercentage: {
      color: 'primary',
      fontSize: 1,
      fontWeight: 'semiBold'
    },
    noPercentage: {
      color: 'notice',
      fontSize: 1,
      fontWeight: 'semiBold'
    },
    abstainPercentage: {
      color: 'secondaryEmphasis',
      fontSize: 1,
      fontWeight: 'semiBold'
    }
  };

  return (
    <Box>
      <Box mb={3}>
        <Text
          as="p"
          variant="h2"
          sx={{
            fontSize: 4,
            fontWeight: 'semiBold'
          }}
        >
          Polling participation overview
        </Text>
        <Text as="p" variant="secondary" color="onSurface">
          Percentage of times that voted yes, no or abstain over time
        </Text>
      </Box>
      <Box>
        <Box sx={styles.titles}>
          <Box>
            <Text
              variant="secondary"
              color="onSecondary"
              sx={{ textTransform: 'uppercase', fontSize: 1, fontWeight: 'bold', mr: 1 }}
              as="p"
            >
              Yes
            </Text>
          </Box>
          <Box>
            <Text
              variant="secondary"
              color="onSecondary"
              sx={{ textTransform: 'uppercase', fontSize: 1, fontWeight: 'bold', ml: 1, mr: 1 }}
              as="p"
            >
              Abstain
            </Text>
          </Box>
          <Box>
            <Text
              variant="secondary"
              color="onSecondary"
              sx={{ textTransform: 'uppercase', fontSize: 1, fontWeight: 'bold', ml: 1 }}
              as="p"
            >
              No
            </Text>
          </Box>
        </Box>
        <Box sx={styles.progressBarWrapper}>
          <Box sx={styles.yesBar} />
          <Box sx={styles.abstainBar} />
          <Box sx={styles.noBar} />
        </Box>
        <Box sx={styles.percentagesWrapper}>
          <Box sx={styles.yesPercentage}>{yesPercent}%</Box>
          <Box sx={styles.abstainPercentage}>{abstainPercent}%</Box>
          <Box sx={styles.noPercentage}>{noPercent}%</Box>
        </Box>
      </Box>
    </Box>
  );
}
