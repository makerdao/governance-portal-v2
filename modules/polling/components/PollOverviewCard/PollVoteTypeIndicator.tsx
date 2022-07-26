import {
  hasVictoryConditionApproval,
  hasVictoryConditionInstantRunOff,
  hasVictoryConditionMajority,
  hasVictoryConditionPlurality
} from 'modules/polling/helpers/utils';
import { Poll } from 'modules/polling/types';
import { Box, Flex, Text } from 'theme-ui';
import { Icon } from '@makerdao/dai-ui-icons';

export function PollVoteTypeIndicator({ poll }: { poll: Poll }): React.ReactElement {
  const isRanked = hasVictoryConditionInstantRunOff(poll.parameters.victoryConditions);
  const isPlurality = hasVictoryConditionPlurality(poll.parameters.victoryConditions);
  const isApproval = hasVictoryConditionApproval(poll.parameters.victoryConditions);
  const isMajority = hasVictoryConditionMajority(poll.parameters.victoryConditions);
  return (
    <Box>
      {isRanked && (
        <Flex sx={{ alignItems: 'center' }}>
          <Text variant="caps">Ranked-choice poll</Text>
          <Icon name="stackedVotes" size={3} ml={2} />
        </Flex>
      )}
      {isPlurality && <Text variant="caps">Plurality poll</Text>}
      {isApproval && <Text variant="caps">Approval poll</Text>}
      {isMajority && !isPlurality && !isApproval && !isRanked && <Text variant="caps">Majority poll</Text>}
    </Box>
  );
}
