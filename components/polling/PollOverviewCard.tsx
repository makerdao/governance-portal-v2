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

const PollOverviewCard = ({ poll, ...props }: { poll: Poll }) => {
  const network = getNetwork();

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
          <CountdownTimer endText="Poll ended" endDate={poll.endDate} />
          <VotingStatus sx={{ display: ['block', 'none'] }} poll={poll} />
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
          {isActivePoll(poll) ? '' : <PollOptionBadge poll={poll} sx={{ color: 'mutedAlt' }} />}
          <VotingStatus sx={{ display: ['none', 'block'] }} poll={poll} />
        </Flex>
      </Stack>
    </Flex>
  );
};

export default PollOverviewCard;
