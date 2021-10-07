/** @jsx jsx */
import Link from 'next/link';
import { Button, Text, Flex, Link as InternalLink, jsx, Box, ThemeUIStyleObject } from 'theme-ui';
import Stack from 'modules/app/components/layout/layouts/Stack';
import { getNetwork } from 'lib/maker';
import CountdownTimer from 'modules/app/components/CountdownTimer';
import PollOptionBadge from 'modules/polling/components/PollOptionBadge';
import { Poll } from 'modules/polling/types';

type Props = {
  poll: Poll;
};

const PollPreviewCard = ({ poll, ...props }: Props): JSX.Element => {
  const network = getNetwork();

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

        <Box sx={{ mb: [1, 2] }}>
          <Text
            sx={
              {
                textOverflow: 'ellipsis',
                fontSize: [2, 3],
                opacity: 0.8,
                display: '-webkit-box',
                overflow: 'hidden',
                WebkitBoxOrient: 'vertical',
                WebkitLineClamp: 2
              } as ThemeUIStyleObject
            }
          >
            {poll.summary}
          </Text>
        </Box>

        <Flex sx={{ alignItems: ['flex-start', 'center'], flexDirection: ['column', 'row'] }}>
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
              <Button
                variant="primaryOutline"
                sx={{ borderRadius: 'small', px: 4, width: ['100%', 'auto'], mt: [2, 0] }}
              >
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
