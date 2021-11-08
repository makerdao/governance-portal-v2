import { Box, Text } from 'theme-ui';
import { Delegate } from '../types';
import Tooltip from 'modules/app/components/Tooltip';

export function DelegateParticipationMetrics({ delegate }: { delegate: Delegate }): React.ReactElement {

  const pollParticipationTooltipLabel = (
    <>
      The percentage of polling votes the delegate has participated in. <br />
      Updated weekly by the GovAlpha Core Unit. <br />
    </>
  );

  const executiveParticipationTooltipLabel = (
    <>
      The percentage of executive votes the delegate has participated in. <br />
      Updated weekly by the GovAlpha Core Unit. <br />
    </>
  );

  const communicationTooltipLabel = (
    <>
      The percentage of votes for which the delegate has publicly <br />
      communicated their reasoning in addition to voting. <br />
      Combines stats for polls and executives. <br />
      Updated weekly by the GovAlpha Core Unit. <br />
    </>
  );


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
        <Tooltip label={pollParticipationTooltipLabel}>
          <Text as="p" sx={styles.text}>
            Poll participation
          </Text>
        </Tooltip>
        <Text as="p" sx={styles.text} ml={2}>
          {delegate.pollParticipation || 'Untracked'}
        </Text>
      </Box>
      <Box sx={styles.row}>
        <Tooltip label={executiveParticipationTooltipLabel}>
          <Text as="p" sx={styles.text}>
            Executive participation
          </Text>
        </Tooltip>
        <Text as="p" sx={styles.text} ml={2}>
          {delegate.executiveParticipation || 'Untracked'}
        </Text>
      </Box>
      <Box sx={styles.row}>
        <Tooltip label={communicationTooltipLabel}>
          <Text as="p" sx={styles.text}>
            Communication
          </Text>
        </Tooltip>
        <Text as="p" sx={styles.text} ml={2}>
          {delegate.communication || 'Untracked'}
        </Text>
      </Box>
    </Box>
  );
}
