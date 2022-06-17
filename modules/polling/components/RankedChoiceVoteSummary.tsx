import { limitString } from 'lib/string';
import { Box } from 'theme-ui';
import { Poll } from '../types';

export function RankedChoiceVoteSummary({
  choices,
  poll,
  limit = 0
}: {
  choices: number[];
  poll: Poll;
  limit?: number;
}): React.ReactElement {
  return (
    <Box>
      {choices
        .filter((item, index) => {
          if (limit === 0) {
            return true;
          } else {
            return index < limit;
          }
        })
        .map((choice, index) => (
          <Box
            key={`voter-${poll.pollId}-option-${choice}-${index}`}
            sx={{
              fontSize: index === 0 ? 2 : 1,
              color: index === 0 ? 'text' : '#708390',
              textAlign: 'right'
            }}
          >
            {limitString(poll.options[choice], 30, '...')} - {index + 1}
          </Box>
        ))}
    </Box>
  );
}
