import { limitString } from 'lib/string';
import { Box } from 'theme-ui';
import { Poll } from '../../types';

export function ApprovalVoteSummary({
  choices,
  poll,
  limit = 0,
  align = 'right'
}: {
  choices: number[];
  poll: Poll;
  limit?: number;
  align?: 'right' | 'left';
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
              fontWeight: index === 0 ? 'semiBold' : 'normal',
              color: index === 0 ? 'text' : '#708390',
              textAlign: align
            }}
            title={poll.options[choice]}
          >
            {align === 'right'
              ? `${limitString(poll.options[choice], 35, '...')}`
              : `${limitString(poll.options[choice], 35, '...')}`}
          </Box>
        ))}
    </Box>
  );
}
