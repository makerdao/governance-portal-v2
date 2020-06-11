/** @jsx jsx */
import Link from 'next/link';
import useSWR from 'swr';
import { NavLink, Text, Flex, Badge, Box, jsx } from 'theme-ui';
import Skeleton from 'react-loading-skeleton';

import { parsePollTally, fetchJson } from '../../lib/utils';
import { getNetwork } from '../../lib/maker';
import CountdownTimer from '../CountdownTimer';
import Poll from '../../types/poll';

type Props = {
  poll: Poll;
};

const PollCard = ({ poll }: Props) => {
  const network = getNetwork();
  const hasPollEnded = new Date(poll.endDate).getTime() < new Date().getTime();

  const { data: tally } = useSWR(
    hasPollEnded
      ? `/api/polling/tally/cache-no-revalidate/${poll.pollId}?network=${network}`
      : `/api/polling/tally/${poll.pollId}?network=${network}`,
    async url => parsePollTally(await fetchJson(url), poll)
  );

  return (
    <div
      sx={{
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        variant: 'cards.primary'
      }}
    >
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
      <Flex>
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
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              fontSize: [3, 4]
            }}
          >
            {poll.title}
          </Text>
        </Link>
      </Flex>

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
      <Flex>
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
          <NavLink variant="buttons.outline">View Proposal</NavLink>
        </Link>
        <Flex sx={{ alignItems: 'cetner' }}>
          {tally ? (
            hasPollEnded ? (
              <Badge
                mx="3"
                variant="primary"
                sx={{
                  borderColor: '#098C7D',
                  color: '#098C7D',
                  textTransform: 'uppercase',
                  alignSelf: 'center'
                }}
              >
                Winning Option: {tally.winningOption}
              </Badge>
            ) : (
              <Badge
                mx="3"
                variant="primary"
                sx={{
                  borderColor: 'text',
                  textTransform: 'uppercase',
                  alignSelf: 'center'
                }}
              >
                Leading Option: {tally.winningOption}
              </Badge>
            )
          ) : (
            <Box m="auto" ml="3" sx={{ width: '300px' }}>
              <Skeleton />
            </Box>
          )}
        </Flex>
      </Flex>
    </div>
  );
};

export default PollCard;
