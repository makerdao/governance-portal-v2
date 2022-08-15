import { limitString } from 'lib/string';
import { isResultDisplayApprovalBreakdown } from 'modules/polling/helpers/utils';
import { Box } from 'theme-ui';
import { Poll } from '../../types';

export function ListVoteSummary({
  choices,
  poll,
  limit = 0,
  align = 'right',
  showOrdinal = true
}: {
  choices: number[];
  poll: Poll;
  limit?: number;
  align?: 'right' | 'left';
  showOrdinal?: boolean;
}): React.ReactElement {
  const isApproval = isResultDisplayApprovalBreakdown(poll.parameters);
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
              fontSize: isApproval ? 2 : index === 0 ? 2 : 1,
              fontWeight: isApproval ? 'semiBold' : index === 0 ? 'semiBold' : 'normal',
              color: isApproval ? '#708390' : index === 0 ? 'text' : '#708390',
              textAlign: align
            }}
            title={poll.options[choice]}
          >
            {align === 'right'
              ? `${limitString(poll.options[choice], 30, '...')}${showOrdinal ? ` - ${index + 1}` : ''}`
              : `${showOrdinal ? ` - ${index + 1}` : ''}${limitString(poll.options[choice], 30, '...')}`}
          </Box>
        ))}
    </Box>
  );
}
