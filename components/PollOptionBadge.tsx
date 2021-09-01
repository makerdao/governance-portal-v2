import { Flex, Box, Badge, ThemeUIStyleObject } from 'theme-ui';
import Skeleton from 'components/SkeletonThemed';

import { isActivePoll } from 'modules/polls/helpers/utils';
import { getNetwork } from 'lib/maker';
import useSWR from 'swr';
import { fetchJson } from 'lib/utils';
import { Poll } from 'modules/polls/types';
import { parseRawPollTally } from 'modules/polls/helpers/parseRawTally';

const PollOptionBadge = ({ poll, ...props }: { poll: Poll; sx?: ThemeUIStyleObject }): JSX.Element => {
  const hasPollEnded = !isActivePoll(poll);
  const network = getNetwork();
  const { data: tally } = useSWR(
    hasPollEnded
      ? `/api/polling/tally/cache-no-revalidate/${poll.pollId}?network=${network}`
      : `/api/polling/tally/${poll.pollId}?network=${network}`,
    async url => parseRawPollTally(await fetchJson(url), poll),
    {
      // don't refresh is poll ended, otherwise refresh every 60 seconds
      refreshInterval: hasPollEnded ? 0 : 60000,
      onErrorRetry: ({ retryCount }) => {
        // only retry up to 3 times
        if (retryCount >= 3) return;
      }
    }
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
