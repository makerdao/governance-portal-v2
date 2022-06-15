import { Box, Text } from 'theme-ui';
import { PollVoteHistory } from '../types/pollVoteHistory';
import { PollVotePluralityResultsCompact } from './PollVotePluralityResultsCompact';
import { Icon } from '@makerdao/dai-ui-icons';
import { InternalLink } from 'modules/app/components/InternalLink';
import { ExternalLink } from 'modules/app/components/ExternalLink';
import { formatDateWithTime } from 'lib/datetime';
import { POLL_VOTE_TYPE } from '../polling.constants';
import { usePollTally } from '../hooks/usePollTally';
import SkeletonThemed from 'modules/app/components/SkeletonThemed';
import { getVoteColor } from '../helpers/getVoteColor';
import { limitString } from 'lib/string';

export function PollVoteHistoryItem({ vote }: { vote: PollVoteHistory }): React.ReactElement {
  const voteDate = formatDateWithTime(vote.blockTimestamp);
  const isPluralityVote = vote.poll.voteType === POLL_VOTE_TYPE.PLURALITY_VOTE;
  const { tally } = usePollTally(vote.pollId);

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
          Voted {voteDate}
        </Text>

        <InternalLink href={`/polling/${vote.poll.slug}`} title="View poll details">
          <Text as="p" sx={{ fontSize: '18px', fontWeight: 'semiBold', color: 'secondaryAlt', mt: 1, mb: 1 }}>
            {vote.poll.title}
          </Text>
        </InternalLink>

        <Box mt={2} sx={{ display: 'flex', alignItems: 'center' }}>
          {vote.poll.discussionLink && (
            <ExternalLink title="Discussion" href={vote.poll.discussionLink} styles={{ mr: 2 }}>
              <Text sx={{ fontSize: 3, fontWeight: 'semiBold' }}>
                Discussion
                <Icon ml={2} name="arrowTopRight" size={2} />
              </Text>
            </ExternalLink>
          )}
        </Box>
      </Box>

      <Box
        sx={{
          display: 'flex',
          justifyContent: isPluralityVote ? 'space-between' : ['flex-start', 'flex-end'],
          flex: 1,
          mt: [2, 0]
        }}
      >
        {isPluralityVote && (
          <Box mr={0} ml={0}>
            {tally && <PollVotePluralityResultsCompact tally={tally} />}
            {!tally && <SkeletonThemed width={'130px'} height={'30px'} />}
          </Box>
        )}

        <Box>
          <Text
            variant="secondary"
            color="onSecondary"
            sx={{
              textTransform: 'uppercase',
              fontSize: 1,
              fontWeight: 'bold',
              textAlign: [isPluralityVote ? 'right' : 'left', 'right']
            }}
            as="p"
          >
            {vote.poll.voteType === POLL_VOTE_TYPE.RANKED_VOTE ? 'VOTED CHOICES' : 'VOTED OPTION'}
          </Text>
          <Text
            as="p"
            sx={{
              textAlign: [isPluralityVote ? 'right' : 'left', 'right'],
              color: getVoteColor(vote.optionId as number, vote.poll.voteType),
              fontWeight: 'semiBold'
            }}
          >
            {vote.poll.voteType === POLL_VOTE_TYPE.RANKED_VOTE
              ? vote.rankedChoiceOption?.map((choice, index) => (
                  <Box
                    key={`voter-${vote.pollId}-option-${choice}`}
                    sx={{ fontSize: index === 0 ? 2 : 1, color: index === 0 ? 'text' : '#708390' }}
                  >
                    {limitString(vote.poll.options[choice], 30, '...')} - {index + 1}
                  </Box>
                ))
              : vote.optionValue}
          </Text>
        </Box>
      </Box>
    </Box>
  );
}
