/** @jsx jsx */
import VoteBreakdown from './VoteBreakdown';
import Tooltip from 'components/Tooltip';
import { getNetwork } from 'lib/maker';
import moment from 'moment';
import Link from 'next/link';
import { Box, Text, jsx, Link as ThemeUILink } from 'theme-ui';
import { PollVoteHistory } from '../types/pollVoteHistory';
import { PollVoteResultsCompact } from './PollVoteResultsCompact';
import { parseRawPollTally } from '../helpers/parseRawTally';

export function PollVoteHistoryItem({ vote }: { vote: PollVoteHistory }): React.ReactElement {
  const network = getNetwork();

  const dateFormat = 'MMM DD YYYY HH:mm zz';
  const voteDate = moment(vote.blockTimestamp);
  const voteBreakdown = (
    <VoteBreakdown poll={vote.poll} tally={parseRawPollTally(vote.tally, vote.poll)} shownOptions={3} key={vote.pollId} />
  );
  return (
    
      <Box sx={{
        display: 'flex',
        justifyContent: 'space-between',
        flexDirection: ['column', 'row']
      }}>

        <Box sx={{
          width: ['100%', '60%'],
          mr: [0, 2]
        }}>
          <Tooltip label={voteBreakdown}>
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
          </Tooltip>
        </Box>

        <Box sx={{
          display: 'flex',
          justifyContent: 'flex-end',
          flex: 1
        }}>
          {/* <Box mr={2}>

            <PollVoteResultsCompact vote={vote} />


          </Box> */}

          <Box>
            <Text
              variant="secondary"
              color="onSecondary"
              sx={{ textTransform: 'uppercase', fontSize: 1, fontWeight: 'semiBold', ml: 1, textAlign: 'right' }}
              as="p"
            >
              Voted
            </Text>
            <Text as="p" sx={{ textAlign: 'right' }}>
              {vote.optionValue}
            </Text>
          </Box>

        </Box>

      </Box>);
}