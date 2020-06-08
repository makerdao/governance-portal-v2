import Link from 'next/link';
import useSWR from 'swr';
import { NavLink, Text, Flex, Badge, Box } from 'theme-ui';
import Skeleton from 'react-loading-skeleton';

import { parsePollTally } from '../../lib/utils';
import { getNetwork } from '../../lib/maker';
import CountdownTimer from '../CountdownTimer';
import Poll from '../../types/poll';

type Props = {
  poll: Poll;
};

const PollCard = ({ poll }: Props) => {
  const network = getNetwork();
  const hasPollEnded = new Date(poll.endDate).getTime() < new Date().getTime();

  const { data: rawTally } = useSWR(
    hasPollEnded
      ? `/api/polling/tally/cache-no-revalidate/${poll.pollId}?network=${network}`
      : `/api/polling/tally/${poll.pollId}?network=${network}`
  );

  const tally = rawTally ? parsePollTally(rawTally, poll) : undefined;

  return (
    <Flex p="4" mx="auto" my="3" variant="cards.primary" sx={{ boxShadow: 'faint', height: '210px' }}>
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
          <CountdownTimer endText="Poll ended" endDate={poll.endDate} />
        </Flex>
        <Link
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
            color: 'primaryText',
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
                    borderColor: '#231536',
                    color: '#231536',
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
      </Flex>
    </Flex>
  );
};

export default PollCard;
