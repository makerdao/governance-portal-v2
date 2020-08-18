import { Box, Text, Flex } from 'theme-ui';
import Poll from '../../types/poll';
import Ballot from '../../types/ballot';
type Props = { ballot: Ballot; polls: Poll[] };
export default function ({ ballot, polls }: Props): JSX.Element {
  const ballotSubmitted = Object.keys(ballot).filter(vote => typeof ballot[vote].submitted !== 'undefined');
  const activePollsNotVoted = polls.filter(poll => !ballotSubmitted.includes(poll.pollId));
  return (
    <Box p={3} sx={{ borderBottom: '1px solid secondaryMuted' }}>
      <Text sx={{ color: 'onSurface', fontSize: 16, fontWeight: '500' }}>
        {`${Object.keys(ballot).length} of ${polls.length} available polls added to ballot`}
      </Text>
      <Flex
        sx={{
          width: '100%',
          height: 2,
          backgroundColor: 'muted',
          mt: 2,
          flexDirection: 'row',
          borderRadius: 'small'
        }}
      >
        {activePollsNotVoted.map((_, index) => (
          <Box
            key={index}
            backgroundColor="muted"
            sx={{
              flex: 1,
              borderLeft: index === 0 ? null : '1px solid white',
              borderTopLeftRadius: index === 0 ? 'small' : null,
              borderBottomLeftRadius: index === 0 ? 'small' : null,
              borderTopRightRadius: index === activePollsNotVoted.length - 1 ? 'small' : null,
              borderBottomRightRadius: index === activePollsNotVoted.length - 1 ? 'small' : null,
              backgroundColor: index < Object.keys(ballot).length ? 'primary' : null
            }}
          />
        ))}
      </Flex>
    </Box>
  );
}
