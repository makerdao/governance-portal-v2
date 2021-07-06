import { Flex, Box, Badge, ThemeUIStyleObject } from 'theme-ui';
import Skeleton from 'react-loading-skeleton';

import { isActivePoll } from 'lib/utils';
import { getNetwork } from 'lib/maker';
import useSWR from 'swr';
import { parsePollTally, fetchJson } from 'lib/utils';
import { Poll } from 'types/poll';

const PollOptionBadge = ({ poll, ...props }: { poll: Poll; sx?: ThemeUIStyleObject }): JSX.Element => {
  const hasPollEnded = !isActivePoll(poll);
  const network = getNetwork();
  const { data: tally } = useSWR(
    hasPollEnded
      ? `/api/polling/tally/cache-no-revalidate/${poll.pollId}?network=${network}`
      : `/api/polling/tally/${poll.pollId}?network=${network}`,
    async url => parsePollTally(await fetchJson(url), poll)
  );

  return (
    <Flex sx={{ alignItems: 'center', color: 'primaryAlt' }}>
      {tally ? (
        hasPollEnded ? (
          <Badge
            {...props}
            variant="primary"
            sx={{
              borderColor: 'inherit',
              color: 'inherit'
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
      )}
    </Flex>
  );
};

export default PollOptionBadge;
