import { Box, Text } from 'theme-ui';
import { PollVoteHistory } from '../types/pollVoteHistory';
import { Icon } from '@makerdao/dai-ui-icons';
import { InternalLink } from 'modules/app/components/InternalLink';
import { ExternalLink } from 'modules/app/components/ExternalLink';
import { formatDateWithTime } from 'lib/datetime';
import { getVoteColor } from '../helpers/getVoteColor';
import { isInputFormatRankFree, isResultDisplaySingleVoteBreakdown } from '../helpers/utils';
import { ListVoteSummary } from './vote-summary/ListVoteSummary';
import { useBreakpointIndex } from '@theme-ui/match-media';
import { formatValue } from 'lib/string';
import { parseUnits } from 'ethers/lib/utils';

export function PollVoteHistoryItem({ vote }: { vote: PollVoteHistory }): React.ReactElement {
  const bpi = useBreakpointIndex();
  const voteDate = formatDateWithTime(vote.blockTimestamp);
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
        <Text
          variant="secondary"
          color="onSecondary"
          sx={{ textTransform: 'uppercase', fontSize: 1, fontWeight: 'bold' }}
          as="p"
        >
          Voted {voteDate} | Poll ID {vote.pollId}
        </Text>

        <InternalLink href={`/polling/${vote.poll.slug}`} title="View poll details">
          <Text as="p" sx={{ fontSize: '18px', fontWeight: 'semiBold', color: 'secondaryAlt', mt: 1, mb: 1 }}>
            {vote.poll.title}
          </Text>
        </InternalLink>

        <Box mt={2} sx={{ display: 'flex', alignItems: 'center' }}>
          {vote.poll.discussionLink && (
            <ExternalLink title="Discussion" href={vote.poll.discussionLink} styles={{ mr: 2, mb: [2, 0] }}>
              <Text sx={{ fontWeight: 'semiBold' }}>
                Discussion
                <Icon ml={2} name="arrowTopRight" size={2} />
              </Text>
            </ExternalLink>
          )}
        </Box>
      </Box>

      <Box
        sx={{
          mt: [2, 0]
        }}
      >
        <Box>
          <Text
            variant="secondary"
            color="onSecondary"
            sx={{
              textTransform: 'uppercase',
              fontSize: 1,
              fontWeight: 'bold',
              textAlign: ['left', 'right']
            }}
            as="p"
          >
            {isInputFormatRankFree(vote.poll.parameters) ? 'VOTED CHOICES' : 'VOTED OPTION'}
          </Text>
          <Text
            as="p"
            sx={{
              textAlign: ['left', 'right'],
              color: getVoteColor(vote.ballot[0], vote.poll.parameters),
              fontWeight: 'semiBold'
            }}
          >
            {isResultDisplaySingleVoteBreakdown(vote.poll.parameters) ? (
              vote.optionValue[0]
            ) : (
              <ListVoteSummary
                choices={vote.ballot || []}
                poll={vote.poll}
                align={bpi < 1 ? 'left' : 'right'}
              />
            )}
          </Text>
        </Box>
        <Box sx={{ mt: 2 }}>
          <Text
            variant="secondary"
            color="onSecondary"
            sx={{
              textTransform: 'uppercase',
              fontSize: 1,
              fontWeight: 'bold',
              textAlign: ['left', 'right']
            }}
            as="p"
          >
            Voting Weight
          </Text>
          <Text
            as="p"
            sx={{
              textAlign: ['left', 'right'],
              fontWeight: 'semiBold'
            }}
          >
            {formatValue(parseUnits(vote.mkrSupport.toString()), undefined, undefined, true, true)} MKR
          </Text>
        </Box>
      </Box>
    </Box>
  );
}
