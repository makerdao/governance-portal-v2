import { Poll } from 'modules/polling/types';
import { Box, Card, Divider, Flex } from 'theme-ui';
import BallotPollBar from '../BallotPollBar';
import VotingWeight from '../VotingWeight';

const ReviewBoxCard = ({ children, ...props }) => (
  <Card variant="compact" p={[0, 0]} {...props}>
    <Flex sx={{ justifyContent: ['center'], flexDirection: 'column' }}>{children}</Flex>
  </Card>
);

export default function ActivePollsBox({
  polls,
  activePolls,
  children,
  voted,
  ...props
}: {
  polls: Poll[];
  activePolls: Poll[];
  voted?: boolean;
  children: React.ReactNode;
}): React.ReactElement {
  return (
    <ReviewBoxCard {...props}>
      <BallotPollBar polls={polls} activePolls={activePolls} voted={voted} />
      <Divider />
      <Box sx={{ px: 3, py: [2, 2], mb: 1 }}>
        <VotingWeight />
      </Box>
      <Divider m={0} sx={{ display: ['none', 'block'] }} />

      {children}
    </ReviewBoxCard>
  );
}
