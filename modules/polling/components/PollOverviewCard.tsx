import Link from 'next/link';
import { Text, Flex, Box, Button, Link as InternalLink, ThemeUIStyleObject, Divider } from 'theme-ui';
import { Icon } from '@makerdao/dai-ui-icons';
import isNil from 'lodash/isNil';

import { isActivePoll } from 'modules/polling/helpers/utils';
import { getNetwork } from 'lib/maker';
import Stack from '../../app/components/layout/layouts/Stack';
import CountdownTimer from '../../app/components/CountdownTimer';
import VotingStatus from './PollVotingStatus';
import { Poll, PollTally } from 'modules/polling/types';
import PollOptionBadge from './PollOptionBadge';
import { useBreakpointIndex } from '@theme-ui/match-media';
import useAccountsStore from 'stores/accounts';
import useBallotStore from 'stores/ballot';
import QuickVote from './QuickVote';
import { useAnalytics } from 'modules/app/client/analytics/useAnalytics';
import { ANALYTICS_PAGES } from 'modules/app/client/analytics/analytics.constants';
import { PollCategoryTag } from './PollCategoryTag';
import useSWR from 'swr';
import { fetchJson } from 'lib/fetchJson';
import { PollVotePluralityResultsCompact } from './PollVotePluralityResultsCompact';
import { POLL_VOTE_TYPE } from '../polling.constants';
import Skeleton from 'react-loading-skeleton';
import BigNumber from 'bignumber.js';

type Props = {
  poll: Poll;
  startMobileVoting?: () => void;
  reviewPage: boolean;
  sx?: ThemeUIStyleObject;
  showVoting?: boolean
};
export default function PollOverviewCard({
  poll,
  startMobileVoting,
  reviewPage,
  showVoting,
  ...props
}: Props): JSX.Element {
  const { trackButtonClick } = useAnalytics(ANALYTICS_PAGES.POLLING);

  const network = getNetwork();
  const account = useAccountsStore(state => state.currentAccount);
  const bpi = useBreakpointIndex({ defaultIndex: 2 });
  const canVote = !!account && isActivePoll(poll);
  const showQuickVote = canVote && bpi > 0 && showVoting;
  const ballot = useBallotStore(state => state.ballot);
  const onBallot = !isNil(ballot[poll.pollId]?.option);

  const { data: tallyData } = useSWR<PollTally>(`/api/polling/tally/${poll.pollId}`, fetchJson, {
    revalidateOnFocus: false
  });

  return (
    <Box aria-label="Poll overview" sx={{ variant: 'cards.primary', p: 0 }} {...props}>
      <Box sx={{ p: [2, 4] }}>
        <Flex sx={{ flexDirection: 'row', justifyContent: 'space-between' }}>
          <Stack gap={3}>
            {bpi === 0 && (
              <Flex sx={{ justifyContent: 'space-between', flexDirection: 'row', flexWrap: 'nowrap' }}>
                <CountdownTimer endText="Poll ended" endDate={poll.endDate} />
                <VotingStatus poll={poll} />
              </Flex>
            )}
            <Box sx={{ cursor: 'pointer' }}>
              <Box>
                <Link href={`/polling/${poll.slug}?network=${network}`} passHref>
                  <InternalLink variant="nostyle">
                    <Text variant="microHeading" sx={{ fontSize: [3, 5] }}>
                      {poll.title}
                    </Text>
                  </InternalLink>
                </Link>
              </Box>
              <Link href={`/polling/${poll.slug}?network=${network}`} passHref>
                <InternalLink variant="nostyle">
                  <Text
                    sx={{
                      fontSize: [2, 3],
                      color: 'textSecondary',
                      mt: 1
                    }}
                  >
                    {poll.summary}
                  </Text>
                </InternalLink>
              </Link>
            </Box>

            <Flex>
              {poll.categories.map(c => (
                <Box key={c} sx={{ marginRight: 2 }}>
                  <PollCategoryTag clickable={true} category={c} />
                </Box>
              ))}
            </Flex>

            {bpi > 0 && (
              <div>
                <CountdownTimer endText="Poll ended" endDate={poll.endDate} />
              </div>
            )}
          </Stack>
          {showQuickVote && <Box sx={{ ml: 2, minWidth: '265px' }}>

            <QuickVote
              poll={poll}
              showHeader={true}
              account={account}
              sx={{ maxWidth: 7 }}
              showStatus={!reviewPage}
            />

          </Box>}
        </Flex>

        <Box>
          <Flex sx={{ alignItems: 'center', justifyContent: 'space-between', flexDirection: ['column-reverse', 'row'] }}>
            <Flex sx={{ alignItems: 'center', justifyContent: 'flex-start', width: bpi > 0 ? 'auto' : '100%', p: bpi > 0 ? 0 : 2 }}>
              {canVote && showVoting &&
                bpi === 0 &&
                (onBallot ? (
                  <Button
                    variant="outline"
                    mr={2}
                    onClick={() => {
                      trackButtonClick('showHistoricalPolls');
                      startMobileVoting && startMobileVoting();
                    }}
                    sx={{
                      display: 'flex',
                      flexDirection: 'row',
                      flexWrap: 'nowrap',
                      alignItems: 'center'
                    }}
                  >
                    <Icon name="edit" size={3} mr={2} />
                    Edit Choices
                  </Button>
                ) : (
                  <Button
                    variant="primary"
                    mr={2}
                    px={4}
                    onClick={() => {
                      trackButtonClick('startMobileVoting');
                      startMobileVoting && startMobileVoting();
                    }}
                  >
                    Vote
                  </Button>
                ))}
              <Link
                key={poll.slug}
                href={{ pathname: '/polling/[poll-hash]', query: { network } }}
                as={{ pathname: `/polling/${poll.slug}`, query: { network } }}
              >
                <InternalLink href={`/polling/${poll.slug}`} variant="nostyle">
                  <Button
                    variant="outline"
                    sx={{
                      display: reviewPage ? 'none' : undefined,
                      borderColor: 'onSecondary',
                      color: 'secondaryAlt',
                      borderRadius: 'small',
                      ':hover': { color: 'text', borderColor: 'onSecondary', backgroundColor: 'background' }
                    }}
                  >
                    View Details
                  </Button>
                </InternalLink>
              </Link>
            </Flex>

            {tallyData && poll.voteType === POLL_VOTE_TYPE.PLURALITY_VOTE && (
              <Box sx={{ width: bpi > 0 ? '265px' : '100%', p: bpi > 0 ? 0 : 2 }}>
                <PollVotePluralityResultsCompact tally={tallyData} />
              </Box>
            )}
          </Flex>
        </Box>
      </Box>
      <Divider my={0} />
      <Flex sx={{ py: 2, justifyContent: 'center', fontSize: [1, 2], color: 'onSecondary' }}>
        {tallyData && tallyData.winningOptionName ? (
          <Text as="p" sx={{ textAlign: 'center', px: [3, 4], mb: 1, wordBreak: 'break-word' }}>
            Currently winning option: {tallyData?.winningOptionName} with{' '}
            {new BigNumber(tallyData.options[tallyData.winner].mkrSupport).toFormat(2)} MKR
          </Text>
        ) : (
          <Skeleton />
        )}
      </Flex>
    </Box>
  );
}
