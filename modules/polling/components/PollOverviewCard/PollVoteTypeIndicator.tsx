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
              <Text>
                Ranked choice voting polls require multiple-choice ballots in ranked order,
                <br />
                and determines the winning vote option by finding the one with an absolute majority in MKR
                voting weight
                <br />
                for first-choice votes, being &gt;50% of the total participating MKR (excluding abstains).
                <br />
                In case no vote option meets the victory requirements, the least popular vote option (except
                abstain)
                <br />
                is omitted and another round of logic is applied until the victory conditions have been met by
                one vote option.
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
              <Text>
                Plurality voting polls require single-choice ballots
                <br /> and determines the winning vote option by finding the one with
                <br /> the highest MKR voting weight in relative terms.
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
              <Text>
                Approval voting polls require multiple-choice ballots in unranked order,
                <br />
                and determines the winning vote option by finding the one with a relative majority
                <br />
                in MKR voting weight. When used in situations where no winner is required, an absolute
                majority
                <br />
                (ie. &gt;50% of the total participating MKR excluding abstains) victory condition may also be
                applied
                <br />
                as opposed to a relative majority.
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
              <Text>
                Majority voting polls require single-choice ballots and determines the winning
                <br />
                vote option by finding the one with an absolute majority in MKR voting weight,
                <br />
                being &gt;50% of the total participating MKR (excluding abstains).
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
