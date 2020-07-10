import { Flex, Box, Badge } from 'theme-ui';
import Skeleton from 'react-loading-skeleton';

const PollOptionBadge = ({tally, hasPollEnded, }) => {

  return (
    <Flex sx={{ alignItems: 'center' }}>
        {tally ? (
            hasPollEnded ? (
            <Badge
                mx="3"
                variant="primary"
                sx={{
                borderColor: 'primaryAlt',
                color: 'primaryAlt',
                textTransform: 'uppercase'
                }}
            >
                Winning Option: {tally.winningOptionName}
            </Badge>
            ) : (
            <Badge
                mx="3"
                variant="primary"
                sx={{
                borderColor: 'text',
                textTransform: 'uppercase'
                }}
            >
                Leading Option: {tally.winningOptionName}
            </Badge>
            )
        ) : (
            <Box m="auto" ml="3" sx={{ width: '300px' }}>
            <Skeleton />
            </Box>
        )}
    </Flex>
  );
};

export default PollOptionBadge;