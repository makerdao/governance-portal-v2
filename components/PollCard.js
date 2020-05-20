import Link from 'next/link';
import useSWR from 'swr';
import { NavLink, Text, Flex, Badge, Box } from 'theme-ui';
import Skeleton from 'react-loading-skeleton';

import { getPollTally } from '../lib/api';
import { getNetwork } from '../lib/maker';
import CountdownTimer from './CountdownTimer';

export default function PollCard({ poll }) {
  const network = getNetwork();

  const { data: tally } = useSWR(
    poll?.pollId ? ['/polling/tally', poll.pollId] : null,
    (_, pollId) => getPollTally(pollId)
  );

  console.log(tally, poll, poll.options[tally?.winner], 'tally');

  return (
    <Flex
      p="4"
      mx="auto"
      my="3"
      variant="cards.primary"
      sx={{ boxShadow: 'faint', height: '210px' }}
    >
      <Flex
        sx={{
          width: '100%',
          flexDirection: 'column',
          justifyContent: 'space-between'
        }}
      >
        <Flex sx={{ justifyContent: 'space-between' }}>
          <Text
            sx={{
              fontSize: [2, 3],
              color: '#708390',
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
          <CountdownTimer endDate={poll.endDate} />
        </Flex>
        <Link
          key={poll.multiHash}
          href={{
            pathname: '/polling/[poll-hash]',
            query: { network }
          }}
          as={{
            pathname: `/polling/${poll.multiHash}`,
            query: { network }
          }}
        >
          <Text
            sx={{
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              fontSize: [3, 4],
              color: '#231536'
            }}
          >
            {poll.title}
          </Text>
        </Link>
        <Text
          sx={{
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            fontSize: [3, 4],
            color: '#434358',
            opacity: 0.8
          }}
        >
          {poll.summary}
        </Text>
        <Flex>
          <Link
            key={poll.multiHash}
            href={{
              pathname: '/polling/[poll-hash]',
              query: { network }
            }}
            as={{
              pathname: `/polling/${poll.multiHash}`,
              query: { network }
            }}
          >
            <NavLink variant="buttons.outline">View Proposal</NavLink>
          </Link>
          <Flex sx={{ alignItems: 'cetner' }}>
            {tally ? (
              <Badge
                mx="3"
                variant="primary"
                sx={{
                  borderColor: '#231536',
                  color: '#231536',
                  textTransform: 'uppercase',
                  alignSelf: 'center'
                }}
              >
                Leading Option: {poll.options[tally.winner]}
              </Badge>
            ) : (
              <Box m="auto" ml="3" sx={{ width: '300px' }}>
                <Skeleton />
              </Box>
            )}
          </Flex>
        </Flex>
      </Flex>
    </Flex>
  );
}
