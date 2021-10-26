import useSWR from 'swr';
import { Box, Badge, ThemeUIStyleObject } from 'theme-ui';
import Skeleton from 'modules/app/components/SkeletonThemed';
import { fetchJson } from 'lib/fetchJson';
import { isActivePoll, getPollApiUrl } from 'modules/polling/helpers/utils';
import { Poll } from 'modules/polling/types';
import { parseRawPollTally } from 'modules/polling/helpers/parseRawTally';

const PollOptionBadge = ({ poll, ...props }: { poll: Poll; sx?: ThemeUIStyleObject }): JSX.Element => {
  const hasPollEnded = !isActivePoll(poll);
  const { data: tally } = useSWR(
    getPollApiUrl(poll),
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
    tally ? (
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
    )
  );
};

export default PollOptionBadge;
