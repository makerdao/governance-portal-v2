import {
  hasVictoryConditionApproval,
  hasVictoryConditionInstantRunOff,
  hasVictoryConditionMajority,
  hasVictoryConditionPlurality
} from 'modules/polling/helpers/utils';
import { Poll } from 'modules/polling/types';
import { Box, Flex, Text } from 'theme-ui';
import { Icon } from '@makerdao/dai-ui-icons';
import TooltipComponent from 'modules/app/components/Tooltip';

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
          <TooltipComponent
            label={
              <Text sx={{ whiteSpace: 'normal' }}>
                Ranked choice voting polls require multiple-choice ballots in ranked order, and determine the
                winning vote option by finding the one with an absolute majority in MKR voting weight (as in
                &gt;50% of the total participating MKR, excluding abstains). In the first round of IRV, only
                first-choice votes are counted. In case no vote option meets the victory requirements, the
                least popular vote option (except abstain) is eliminated and the votes applied to that option
                are instead applied to the voters’ next ranked option. This repeats until the victory
                conditions have been met by one vote option. If no winning option can be found, tally results
                are shown as if no IRV rounds were run.
              </Text>
            }
          >
            <Flex>
              <Icon name="stackedVotes" size={3} ml={2} color={'textSecondary'} />
            </Flex>
          </TooltipComponent>
        </Flex>
      )}
      {isPlurality && (
        <Flex sx={{ alignItems: 'center' }}>
          <Text variant="caps">Plurality poll</Text>
          <TooltipComponent
            label={
              <Text sx={{ whiteSpace: 'normal' }}>
                Plurality voting polls require single-choice ballots and determines the winning vote option by
                finding the one with the highest MKR voting weight in relative terms.
              </Text>
            }
          >
            <Flex sx={{ mb: '2px' }}>
              <Icon name="question" ml={2} color={'textSecondary'} />
            </Flex>
          </TooltipComponent>
        </Flex>
      )}
      {isApproval && (
        <Flex sx={{ alignItems: 'center' }}>
          <Text variant="caps">Approval poll</Text>
          <TooltipComponent
            label={
              <Text sx={{ whiteSpace: 'normal' }}>
                Approval voting polls require multiple-choice ballots in unranked order, and determines the
                winning vote option by finding the one with a relative majority in MKR voting weight. When
                used in situations where no winner is required, an absolute majority (ie. &gt;50% of the total
                participating MKR excluding abstains) victory condition may also be applied as opposed to a
                relative majority.
              </Text>
            }
          >
            <Flex sx={{ mb: '2px' }}>
              <Icon name="question" ml={2} color={'textSecondary'} />
            </Flex>
          </TooltipComponent>
        </Flex>
      )}

      {isMajority && !isPlurality && !isApproval && !isRanked && (
        <Flex sx={{ alignItems: 'center' }}>
          <Text variant="caps">Majority poll</Text>
          <TooltipComponent
            label={
              <Text sx={{ whiteSpace: 'normal' }}>
                Majority voting polls require single-choice ballots and determines the winning vote option by
                finding the one with an absolute majority in MKR voting weight, being &gt;50% of the total
                participating MKR (excluding abstains).
              </Text>
            }
          >
            <Flex sx={{ mb: '2px' }}>
              <Icon name="question" ml={2} color={'textSecondary'} />
            </Flex>
          </TooltipComponent>
        </Flex>
      )}
    </Box>
  );
}
