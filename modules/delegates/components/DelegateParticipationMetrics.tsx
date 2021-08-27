/** @jsx jsx */
import BigNumber from 'bignumber.js';
import { Box, Text, jsx } from 'theme-ui';
import { Delegate } from '../types';

export function DelegateParticipationMetrics({ delegate }: { delegate: Delegate }): React.ReactElement {
  const styles = {
    row: {
      display: 'flex',
      justifyContent: 'space-between',
      marginTop: 1,
      marginBottom: 1
    },
    text: {
      color: 'secondaryAlt',
      fontWeight: 'semiBold',
      fontSize: 3
    }
  };
  return (
    <Box p={[3, 4]}>
      <Text as="p" sx={{
        fontSize: '18px',
        fontWeight: 500,
        mb: 3
      }}>Participation breakdown</Text>

      <Box sx={styles.row}>
        <Text as="p" sx={styles.text}>
          Participation
        </Text>
        <Text as="p" sx={styles.text} ml={2}>
          {delegate.combinedParticipation ?? 'Untracked'}
        </Text>
      </Box>
      <Box sx={styles.row}>
        <Text as="p" sx={styles.text}>
          Communicatiopn
        </Text>
        <Text as="p" sx={styles.text} ml={2}>
          {delegate.communication ?? 'Untracked'}
        </Text>
      </Box>
      <Box sx={styles.row}>
        <Text as="p" sx={styles.text}>
          MKR Delegated
        </Text>
        <Text as="p" sx={styles.text} ml={2}>
          {new BigNumber(delegate.mkrDelegated).toFormat(2) ?? 'Untracked'}MKR
        </Text>
      </Box>
    </Box>
  );
}