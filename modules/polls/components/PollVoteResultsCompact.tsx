/** @jsx jsx */
import { Box, Text, jsx } from 'theme-ui';

export function PollVoteResultsCompact(): React.ReactElement {
  const styles = {
    titles: {
      display: 'flex',
      justifyContent: 'space-between'
    },
    progressBarWrapper: {
      display: 'flex'
    },
    yesBar: {
      background: 'green',
      width: '80%',
      height: '4px'
    },
    noBar: {
      background: 'red',
      width: '10%',
      height: '4px'
    },
    abstainBar: {
      background: 'grey',
      width: '10%',
      height: '4px'
    },
    percentagesWrapper: {
      display: 'flex',
      justifyContent: 'space-between'
    },
    yesPercentage: {
      color: 'green'
    },
    noPercentage: {
      color: 'red'
    },
    abstainPercentage: {
      color: 'grey'
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