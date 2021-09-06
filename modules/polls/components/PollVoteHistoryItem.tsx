/** @jsx jsx */
import VoteBreakdown from './VoteBreakdown';
import Tooltip from 'components/Tooltip';
import { getNetwork } from 'lib/maker';
import moment from 'moment';
import Link from 'next/link';
import { Box, Text, jsx, Link as ThemeUILink } from 'theme-ui';
import { PollVoteHistory } from '../types/pollVoteHistory';
import { PollVotePluralityResultsCompact } from './PollVotePluralityResultsCompact';
import { parseRawPollTally } from '../helpers/parseRawTally';
import { Icon } from '@makerdao/dai-ui-icons';
import { POLL_VOTE_TYPE } from '../polls.constants';

export function PollVoteHistoryItem({ vote }: { vote: PollVoteHistory }): React.ReactElement {
  const network = getNetwork();

  const dateFormat = 'MMM DD YYYY HH:mm zz';
  const voteDate = moment(vote.blockTimestamp);
  const voteBreakdown = (
    <VoteBreakdown
      poll={vote.poll}
      tally={parseRawPollTally(vote.tally, vote.poll)}
      shownOptions={3}
      key={vote.pollId}
    />
  );

  const voteColorStyles = ['secondaryEmphasis', 'primary', 'notice'];
  return (
    <Box
      sx={{
        display: 'flex',
        justifyContent: 'space-between',
        flexDirection: ['column', 'row']
      }}
    >
      <Box
        sx={{
          width: ['100%', '60%'],
          mr: [0, 2]
        }}
      >
        <Tooltip label={voteBreakdown}>
          <Box>
            <Text
              variant="secondary"
              color="onSecondary"
              sx={{ textTransform: 'uppercase', fontSize: 1, fontWeight: 'bold' }}
              as="p"
            >
              Voted {voteDate.format(dateFormat)}
            </Text>

            <Link href={{ pathname: `/polling/${vote.poll.slug}`, query: { network } }} passHref>
              <ThemeUILink href={`/polling/${vote.poll.slug}`} variant="nostyle">
                <Text
                  as="p"
                  sx={{ fontSize: '18px', fontWeight: 'semiBold', color: 'secondaryAlt', mt: 1, mb: 1 }}
                >
                  {vote.poll.title}
                </Text>
              </ThemeUILink>
            </Link>

            <Box mt={2} sx={{ display: 'flex', alignItems: 'center' }}>
              {vote.poll.discussionLink && (
                <ThemeUILink
                  title="Discussion"
                  href={vote.poll.discussionLink}
                  target="_blank"
                  sx={{ mr: 2 }}
                >
                  <Text sx={{ fontSize: 3, fontWeight: 'semiBold' }}>
                    Discussion
                    <Icon ml={2} name="arrowTopRight" size={2} />
                  </Text>
                </ThemeUILink>
              )}
            </Box>
          </Box>
        </Tooltip>
      </Box>

      <Box
        sx={{
          display: 'flex',
          justifyContent:
            vote.poll.voteType === POLL_VOTE_TYPE.PLURALITY_VOTE
              ? 'space-between'
              : ['flex-start', 'flex-end'],
          flex: 1,
          mt: [2, 0]
        }}
      >
        {vote.poll.voteType === POLL_VOTE_TYPE.PLURALITY_VOTE && (
          <Box mr={0} ml={0}>
            <PollVotePluralityResultsCompact vote={vote} />
          </Box>
        )}

        <Box>
          <Text
            variant="secondary"
            color="onSecondary"
            sx={{ textTransform: 'uppercase', fontSize: 1, fontWeight: 'bold', textAlign: 'right' }}
            as="p"
          >
            Option {vote.poll.voteType === POLL_VOTE_TYPE.RANKED_VOTE && '(Ranked Choice)'}
          </Text>
          <Text
            as="p"
            sx={{
              textAlign: 'right',
              color:
                vote.poll.voteType !== POLL_VOTE_TYPE.RANKED_VOTE
                  ? voteColorStyles[vote.option || 0]
                  : 'secondaryEmphasis',
              fontWeight: 'semiBold'
            }}
          >
            {vote.optionValue}
          </Text>
        </Box>
      </Box>
    </Box>
  );
}
