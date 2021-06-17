/** @jsx jsx */
import Link from 'next/link';
import { Button, Text, Flex, Link as InternalLink, jsx } from 'theme-ui';
import { useBreakpointIndex } from '@theme-ui/match-media';

import Stack from '../layouts/Stack';
import { getNetwork } from '../../lib/maker';
import CountdownTimer from '../CountdownTimer';
import PollOptionBadge from '../PollOptionBadge';
import Poll from '@types/poll';

type Props = {
  poll: Poll;
};

const PollPreviewCard = ({ poll, ...props }: Props): JSX.Element => {
  const network = getNetwork();
  const bpi = useBreakpointIndex();

  return (
    <div {...props}>
      <Stack gap={2} sx={{ variant: 'cards.primary' }}>
        <Flex sx={{ justifyContent: 'space-between' }}>
          <Text
            variant="caps"
            sx={{
              color: 'textSecondary'
            }}
          >
            <Text sx={{ display: ['none', 'inline'] }}>Posted </Text>
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
            <InternalLink href={`/polling/${poll.slug}`} variant="nostyle">
              <Text variant="microHeading" sx={{ fontSize: [3, 4], cursor: 'pointer' }}>
                {poll.title}
              </Text>
            </InternalLink>
          </Link>
        </Flex>

        <Text
          sx={
            {
              textOverflow: 'ellipsis',
              fontSize: [2, 3],
              opacity: 0.8,
              mb: [1, 2],
              display: '-webkit-box',
              overflow: 'hidden',
              WebkitBoxOrient: 'vertical',
              WebkitLineClamp: 2
            } as any
          }
        >
          {poll.summary}
        </Text>
        <Flex sx={{ alignItems: 'center', flexWrap: 'wrap' }}>
          <PollOptionBadge poll={poll} sx={{ mb: 2, display: ['block', 'none'] }} />
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
            <InternalLink href={`/polling/${poll.slug}`} variant="nostyle">
              <Button variant="primaryOutline" sx={{ borderRadius: 'small', px: 4, width: ['100%', 'auto'] }}>
                View proposal
              </Button>
            </InternalLink>
          </Link>
          <PollOptionBadge poll={poll} sx={{ ml: 3, display: ['none', 'block'] }} />
        </Flex>
      </Stack>
    </div>
  );
};

export default PollPreviewCard;
