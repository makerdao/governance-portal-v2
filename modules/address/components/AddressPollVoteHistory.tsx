/** @jsx jsx */
import { PollVoteHistory } from 'modules/polls/types/pollVoteHistory';
import { Box, Flex, Heading, Text, jsx } from 'theme-ui';
export function AddressPollVoteHistory({ votes }: { votes: PollVoteHistory[] }): React.ReactElement {
  return (
    <Box>
      {
        votes.length > 0 && votes.map(vh => {
          const title = vh.title;
          const option = vh.optionValue;
          const date = vh.blockTimestamp;
          return (
            <Flex
              key={title}
              sx={{
                py: 2,
                flexDirection: 'column',
                border: 'light',
                borderColor: 'muted',
                borderRadius: 'roundish',
                p: 2,
                my: 2
              }}
            >
              <Heading variant="microHeading">{title}</Heading>
              <Text>
                Voted: <span sx={{ fontWeight: 'bold' }}>{option}</span> on{' '}
                <span sx={{ variant: 'text.caps' }}>{new Date(date).toDateString()}</span>
              </Text>
            </Flex>
          );
        })
      }
      {votes.length === 0 && <Box mt={1}>
        <Text>This address has never voted</Text>
      </Box>}
    </Box>
  );
}