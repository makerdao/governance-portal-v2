 
import BigNumber from 'bignumber.js';
import { Box, Text, jsx } from 'theme-ui';
import { Delegate } from '../types';

export function DelegateParticipationMetrics({ delegate }: { delegate: Delegate }): React.ReactElement {
  const styles = {
    row: {
      display: 'flex',
      justifyContent: 'space-between',
      marginTop: 3,
      marginBottom: 3
    },
    text: {
      color: 'onBackground',
      fontWeight: 'semiBold',
      fontSize: 3
    }
  };
  return (
    <Box p={[3, 4]}>
      <Text
        as="p"
        sx={{
          fontSize: '18px',
          fontWeight: 'semiBold',
          mb: 3
        }}
      >
        Participation breakdown
      </Text>

      <Box sx={styles.row}>
        <Text as="p" sx={styles.text}>
          Poll participation
        </Text>
        <Text as="p" sx={styles.text} ml={2}>
          {delegate.pollParticipation || 'Untracked'}
        </Text>
      </Box>
      <Box sx={styles.row}>
        <Text as="p" sx={styles.text}>
          Executive participation
        </Text>
        <Text as="p" sx={styles.text} ml={2}>
          {delegate.executiveParticipation || 'Untracked'}
        </Text>
      </Box>
      <Box sx={styles.row}>
        <Text as="p" sx={styles.text}>
          Communication
        </Text>
        <Text as="p" sx={styles.text} ml={2}>
          {delegate.communication || 'Untracked'}
        </Text>
      </Box>
    </Box>
  );
}
