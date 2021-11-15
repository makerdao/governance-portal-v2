import { Box, Badge, ThemeUIStyleObject } from 'theme-ui';
import Skeleton from 'modules/app/components/SkeletonThemed';
import { isActivePoll } from 'modules/polling/helpers/utils';
import { Poll, PollTally } from 'modules/polling/types';

const PollOptionBadge = ({
  poll,
  tally,
  ...props
}: {
  poll: Poll;
  tally?: PollTally;
  sx?: ThemeUIStyleObject;
}): JSX.Element => {
  const hasPollEnded = !isActivePoll(poll);

  return tally ? (
    hasPollEnded ? (
      <Badge
        {...props}
        variant="primary"
        sx={{
          borderColor: 'inherit',
          color: 'primaryAlt'
        }}
      >
        Winning Option: {tally.winningOptionName}
      </Badge>
    ) : (
      <Badge
        {...props}
        variant="primary"
        sx={{
          borderColor: 'text',
          textTransform: 'uppercase'
        }}
      >
        Leading Option: {tally.winningOptionName}
      </Badge>
    )
  ) : (
    <Box sx={{ width: '140px', justifyContent: 'right' }} {...props}>
      <Skeleton />
    </Box>
  );
};

export default PollOptionBadge;
