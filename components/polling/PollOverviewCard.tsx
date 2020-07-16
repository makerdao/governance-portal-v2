/** @jsx jsx */
import Link from 'next/link';
import { Text, Flex, Divider, Box, Button, jsx } from 'theme-ui';

import { isActivePoll } from '../../lib/utils';
import { getNetwork } from '../../lib/maker';
import Stack from '../layouts/Stack';
import CountdownTimer from '../CountdownTimer';
import VotingStatus from './VotingStatus';
import Poll from '../../types/poll';
import PollOptionBadge from '../PollOptionBadge';
import useBallotStore from '../../stores/ballot';

const PollOverviewCard = ({ poll, ...props }: { poll: Poll }) => {
  const network = getNetwork();

  //todo: remove once done testing, set to true to test out ballot zustand store
  const DEV_TEST_BALLOT_STATE = false;
  const { ballot, addToBallot, clearBallot, submitBallot } = useBallotStore();
  if (DEV_TEST_BALLOT_STATE) {
    console.log('ballot', ballot);
  }

  return (
    <Flex
      sx={{
        flexDirection: 'column',
        justifyContent: 'space-between',
        variant: 'cards.primary'
      }}
      {...props}
    >
      <Stack gap={2}>
        <Flex sx={{ justifyContent: 'space-between' }}>
          <Text
            sx={{
              fontSize: [2, 3],
              color: 'mutedAlt',
              textTransform: 'uppercase'
            }}
          >
            Posted{' '}
            {new Date(poll.startDate).toLocaleString('default', {
              month: 'long',
              day: 'numeric',
              year: 'numeric'
            })}
          </Text>
          <CountdownTimer endText="Poll ended" endDate={poll.endDate} />
        </Flex>
        <Box>
          <Link
            href={{
              pathname: '/polling/[poll-hash]',
              query: { network }
            }}
            as={{
              pathname: `/polling/${poll.slug}`,
              query: { network }
            }}
          >
            <Text
              sx={{
                fontSize: [3, 4],
                whiteSpace: 'nowrap',
                overflowX: 'auto'
              }}
            >
              {poll.title}
            </Text>
          </Link>
        </Box>
        <Text
          sx={{
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            fontSize: [3, 4],
            opacity: 0.8
          }}
        >
          {poll.summary}
        </Text>
        <div sx={{ pb: 2, pt: 3 }}>
          <Divider my={0} mx={-4} />
        </div>
        <Flex sx={{ alignItems: 'center' }}>
          <Link
            key={poll.slug}
            href={{
              pathname: '/polling/[poll-hash]',
              query: { network }
            }}
            as={{
              pathname: `/polling/${poll.slug}`,
              query: { network }
            }}
          >
            <Button variant={isActivePoll(poll) ? 'primary' : 'outline'}>View Details</Button>
          </Link>
          {/* remove once done testing */}
          {DEV_TEST_BALLOT_STATE ? (
            <div>
              <Button
                onClick={() => {
                  addToBallot(poll.pollId, 1);
                }}
              >
                Add to Ballot
              </Button>
              <Button
                onClick={() => {
                  addToBallot(poll.pollId, null);
                }}
              >
                Remove Ballot Vote
              </Button>
              <Button
                onClick={() => {
                  clearBallot();
                }}
              >
                Clear Entire Ballot
              </Button>
              <Button
                onClick={() => {
                  submitBallot();
                }}
              >
                Submit Entire Ballot
              </Button>
            </div>
          ) : (
            ''
          )}
          {isActivePoll(poll) ? '' : <PollOptionBadge poll={poll} sx={{ color: 'mutedAlt' }} />}
          <VotingStatus poll={poll} />
        </Flex>
      </Stack>
    </Flex>
  );
};

export default PollOverviewCard;
