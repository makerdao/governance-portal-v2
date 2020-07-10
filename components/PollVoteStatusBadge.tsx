import { Flex, Box, Badge } from 'theme-ui';
import Skeleton from 'react-loading-skeleton';
import { Icon, Text } from '@makerdao/dai-ui-icons';

const PollVoteStatusBadge = ({ onBallot, voted, hasPollEnded }) => {
  return (
    <Flex sx={{ alignItems: 'center' }}>
        {voted ? (
        <Badge
            mx="3"
            px="14px"
            variant="primary"
            sx={{
            borderColor: 'linkHover',
            color: 'linkHover',
            textTransform: 'uppercase'
            }}
        >
            <Flex sx={{ alignItems: 'center' }}>
                <Icon mr="1" name="verified" sx={{ color: 'linkHover' }} />
                You Voted
            </Flex>
        </Badge>
        ) : 
        onBallot ?
        (
        <Badge
            mx="3"
            px="14px"
            variant="primary"
            sx={{
            borderColor: 'linkHover',
            color: 'linkHover',
            textTransform: 'uppercase'
            }}
        >
            On Your Ballot
        </Badge>
        ) :
        (
            <Badge
            mx="3"
            px="14px"
            variant="primary"
            sx={{
            borderColor: 'badgeGrey',
            color: 'badgeGrey',
            textTransform: 'uppercase'
            }}
        >
            {hasPollEnded ? 'You did not vote': 'You have not voted'} 
        </Badge>
        )}
    </Flex>
  );
};

export default PollVoteStatusBadge;