import { limitString } from 'lib/string';
import { getNumberWithOrdinal } from 'lib/utils';
import { getVoteColor } from 'modules/polling/helpers/getVoteColor';
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
        .map((choice, index) => {
          const choiceText = poll.options[choice].toString();
          return (
            <Box
              key={`voter-${poll.pollId}-option-${choice}-${index}`}
              sx={{
                fontSize: isApproval ? 2 : index === 0 ? 2 : 1,
                fontWeight: 'normal',
                color: getVoteColor(choice, poll.parameters),
                textAlign: align
              }}
              title={choiceText}
            >
              {align === 'right'
                ? `${limitString(choiceText, 30, '...')}${
                    showOrdinal ? ` - ${getNumberWithOrdinal(index + 1)}` : ''
                  }`
                : `${showOrdinal ? `${getNumberWithOrdinal(index + 1)} - ` : ''}${limitString(
                    choiceText,
                    30,
                    '...'
                  )}`}
            </Box>
          );
        })}
    </Box>
  );
}
