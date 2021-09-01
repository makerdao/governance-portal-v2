/** @jsx jsx */
import BigNumber from 'bignumber.js';
import { Box, Text, jsx } from 'theme-ui';
import { PollVoteHistory } from '../types/pollVoteHistory';

export function PollVotePluralityResultsCompact({ vote }: { vote: PollVoteHistory }): React.ReactElement {
  const max = new BigNumber(vote.tally.totalMkrParticipation);

  const abstainValue = new BigNumber(vote.tally.options['0'] ? vote.tally.options['0'].firstChoice : 0);
  const yesValue = new BigNumber(vote.tally.options['1'] ? vote.tally.options['1'].firstChoice : 0);
  const noValue = new BigNumber(vote.tally.options['2'] ? vote.tally.options['2'].firstChoice : 0);

  const yesPercent = yesValue.dividedBy(max).multipliedBy(100).toFixed(0);
  const abstainPercent = abstainValue.dividedBy(max).multipliedBy(100).toFixed(0);
  const noPercent = noValue.dividedBy(max).multipliedBy(100).toFixed(0);

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

      <Box sx={styles.percentagesWrapper}>
        <Box sx={styles.yesPercentage}>{yesPercent}%</Box>
        <Box sx={styles.abstainPercentage}>{abstainPercent}%</Box>
        <Box sx={styles.noPercentage}>{noPercent}%</Box>
      </Box>

      <Box sx={styles.progressBarWrapper}>
        <Box sx={styles.yesBar} />
        <Box sx={styles.abstainBar} />
        <Box sx={styles.noBar} />
      </Box>
    </Box>
  );
}
