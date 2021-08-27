/** @jsx jsx */
import { Box, Text, jsx } from 'theme-ui';
import { PollVoteHistory } from '../types/pollVoteHistory';

export function PollVoteResultsCompact({vote }: {vote: PollVoteHistory}): React.ReactElement {
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
      width: '80%',
      height: '4px'
    },
    noBar: {
      backgroundColor: 'notice',
      width: '10%',
      height: '4px'
    },
    abstainBar: {
      backgroundColor: 'secondary',
      width: '10%',
      height: '4px'
    },
    percentagesWrapper: {
      display: 'flex',
      justifyContent: 'space-between'
    },
    yesPercentage: {
      color: 'primary'
    },
    noPercentage: {
      color: 'notice'
    },
    abstainPercentage: {
      color: 'secondaryEmphasis'
    },
    
  };

  return (
    <Box>
      <Box sx={styles.titles}>
        <Box>
          <Text
            variant="secondary"
            color="onSecondary"
            sx={{ textTransform: 'uppercase', fontSize: 1, fontWeight: 'semiBold', ml: 1, mr: 1}}
            as="p"
          >
            Yes
          </Text>
        </Box>
        <Box>
          <Text
            variant="secondary"
            color="onSecondary"
            sx={{ textTransform: 'uppercase', fontSize: 1, fontWeight: 'semiBold', ml: 1, mr: 1}}
            as="p"
          >
            Abstain
          </Text>
        </Box>
        <Box>
          <Text
            variant="secondary"
            color="onSecondary"
            sx={{ textTransform: 'uppercase', fontSize: 1, fontWeight: 'semiBold', ml: 1, mr: 1}}
            as="p"
          >
            No
          </Text>
        </Box>
      </Box>

      <Box sx={styles.progressBarWrapper}>
        <Box sx={styles.yesBar}/>
        <Box sx={styles.abstainBar}/>
        <Box sx={styles.noBar}/>
      </Box>

      <Box sx={styles.percentagesWrapper}>
        <Box sx={styles.yesPercentage}>80%</Box>
        <Box sx={styles.abstainPercentage}>10%</Box>
        <Box sx={styles.noPercentage}>10%</Box>
      </Box>
    </Box>
  );
}