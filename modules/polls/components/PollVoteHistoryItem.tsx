/** @jsx jsx */
import { getNetwork } from 'lib/maker';
import moment from 'moment';
import Link from 'next/link';
import { Box, Text, jsx, Link as ThemeUILink } from 'theme-ui';
import { PollVoteHistory } from '../types/pollVoteHistory';
import { PollVoteResultsCompact } from './PollVoteResultsCompact';

export function PollVoteHistoryItem({ vote }: { vote: PollVoteHistory }): React.ReactElement {
  const network = getNetwork();

  const dateFormat = 'MMM DD YYYY HH:mm zz';
  const voteDate = moment(vote.blockTimestamp);

  
  return (<Box sx={{
    display: 'flex',
    justifyContent: 'space-between'
  }}>

    <Box>
      <Text
        variant="secondary"
        color="onSecondary"
        sx={{ textTransform: 'uppercase', fontSize: 1, fontWeight: 'semiBold' }}
        as="p"
      >
        Voted {voteDate.format(dateFormat)}
      </Text>

      <Link
        href={{ pathname: `/polling/${vote.poll.slug}`, query: { network } }} passHref
      >
        <ThemeUILink href={`/polling/${vote.poll.slug}`} variant="nostyle">
          <Text as='p' sx={{ fontSize: '18px', fontWeight: 'semiBold', color: 'secondaryAlt', mt: 1, mb: 1 }}>
            {vote.poll.title}
          </Text>
        </ThemeUILink>
      </Link>
    </Box>

    <Box>
      <PollVoteResultsCompact />
    </Box>

    <Box>
      <Text
        variant="secondary"
        color="onSecondary"
        sx={{ textTransform: 'uppercase', fontSize: 1, fontWeight: 'semiBold', ml: 1 }}
        as="p"
      >
        Voted
      </Text>
      <Text as="p">
        {vote.optionValue}
      </Text>
    </Box>
  </Box>);
}