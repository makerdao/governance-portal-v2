import { Box, Text, Progress, Flex } from 'theme-ui';
import Skeleton from 'modules/app/components/SkeletonThemed';
import Tooltip from 'modules/app/components/Tooltip';
import Delay from 'modules/app/components/Delay';
import { Icon } from '@makerdao/dai-ui-icons';
import { PollTally, Poll, RankedChoiceResult, PluralityResult } from 'modules/polling/types';
import { PollResultDisplay } from 'modules/polling/polling.constants';
import { getVoteColor } from 'modules/polling/helpers/getVoteColor';
import { BigNumber as BigNumberJS } from 'bignumber.js';
import { formatValue } from 'lib/string';
import { parseUnits } from 'ethers/lib/utils';

export default function VoteBreakdown({
  poll,
  shownOptions,
  tally
}: {
  poll: Poll;
  shownOptions: number;
  tally: PollTally | undefined;
}): JSX.Element {
  if (poll.parameters.resultDisplay === PollResultDisplay.instantRunoffBreakdown) {
    return (
      <Box key={2} sx={{ p: [3, 4] }} data-testid="vote-breakdown">
        <Flex sx={{ flexDirection: ['column', 'row'], justifyContent: 'space-between' }}>
          <Text variant="microHeading" sx={{ display: 'block', mb: 3 }}>
            Vote Breakdown
          </Text>
          <Flex sx={{ alignItems: 'center', mb: 3 }}>
            <Text variant="caps">Ranked-choice poll</Text>
            <Icon name="stackedVotes" size={3} ml={2} />
          </Flex>
        </Flex>
        {Object.keys(poll.options)
          .slice(0, shownOptions)
          .map((_, i) => {
            const tallyResult = tally?.results[i] as RankedChoiceResult;
            const firstChoice = new BigNumberJS(tallyResult.firstChoice || 0);
            const transfer = new BigNumberJS(tallyResult.transfer || 0);
            return (
              <div key={i}>
                <Flex sx={{ flexDirection: ['column', 'row'], justifyContent: 'space-between' }}>
                  {tallyResult ? (
                    <Text as="p" sx={{ color: 'textSecondary', mr: 2 }}>
                      {tallyResult.optionName}
                    </Text>
                  ) : (
                    <Delay>
                      <Skeleton />
                    </Delay>
                  )}
                  {tallyResult ? (
                    <Text as="p" sx={{ color: 'textSecondary', width: tally ? 'unset' : '30%' }}>
                      {`${formatValue(
                        parseUnits(firstChoice.plus(transfer).toString())
                      )} MKR Voting (${formatValue(
                        parseUnits(
                          new BigNumberJS(tallyResult.firstPct).plus(tallyResult.transferPct).toString()
                        )
                      )}%)`}
                    </Text>
                  ) : (
                    <Delay>
                      <Skeleton />
                    </Delay>
                  )}
                </Flex>

                {tally && tallyResult ? (
                  <Box sx={{ position: 'relative', mb: 4 }}>
                    <Tooltip
                      label={`First choice ${formatValue(
                        parseUnits(firstChoice.toString())
                      )}; Transfer ${formatValue(parseUnits(transfer.toString()))}`}
                    >
                      <Box my={2}>
                        <Box>
                          <Progress
                            sx={{
                              backgroundColor: 'muted',
                              height: 2,
                              color: `${transfer.lt(0) ? '#f57350' : '#27ab9b'}`,
                              position: 'absolute'
                            }}
                            max={tally.totalMkrParticipation}
                            value={
                              transfer.lt(0) ? firstChoice.toNumber() : firstChoice.plus(transfer).toNumber()
                            }
                          />
                        </Box>
                        <Box>
                          <Progress
                            sx={{
                              backgroundColor: 'transparent',
                              height: 2,
                              color: 'primary',
                              position: 'absolute'
                            }}
                            max={tally.totalMkrParticipation}
                            value={
                              transfer.lt(0) ? firstChoice.plus(transfer).toNumber() : firstChoice.toNumber()
                            }
                          />
                        </Box>
                      </Box>
                    </Tooltip>
                  </Box>
                ) : (
                  <Delay>
                    <Skeleton />
                  </Delay>
                )}
              </div>
            );
          })}
      </Box>
    );
  }

  return (
    <div key={2} sx={{ p: [3, 4], fontSize: [2, 3] }}>
      <Text variant="microHeading" sx={{ display: 'block', mb: 3 }}>
        Vote Breakdown
      </Text>
      {Object.keys(poll.options).map((_, i) => {
        const tallyResult = tally?.results[i] as PluralityResult;
        const mkrSupport = tally && tallyResult && tallyResult.mkrSupport ? tallyResult.mkrSupport : 0;

        return (
          <div key={i}>
            <Flex sx={{ justifyContent: 'space-between' }}>
              {tallyResult ? (
                <Text as="p" sx={{ color: 'textSecondary', width: '20%', mr: 2 }}>
                  {tallyResult.optionName}
                </Text>
              ) : (
                <Delay>
                  <Skeleton />
                </Delay>
              )}
              {tally && tallyResult ? (
                <Text
                  as="p"
                  sx={{
                    color: 'textSecondary',
                    width: tally ? 'unset' : '30%',
                    textAlign: 'right'
                  }}
                >
                  {`${formatValue(parseUnits(mkrSupport.toString()))} MKR Voting (${formatValue(
                    parseUnits(tallyResult.firstPct.toString())
                  )}%)`}
                </Text>
              ) : (
                <Delay>
                  <Skeleton />
                </Delay>
              )}
            </Flex>

            {tally && tallyResult ? (
              <Tooltip label={`First choice ${formatValue(parseUnits(mkrSupport.toString()))}`}>
                <Box my={2}>
                  <Progress
                    sx={{
                      backgroundColor: 'muted',
                      mb: '3',
                      height: 2,
                      color: getVoteColor(parseInt(tallyResult.optionId), poll.voteType)
                    }}
                    max={tally.totalMkrParticipation}
                    value={mkrSupport}
                  />
                </Box>
              </Tooltip>
            ) : (
              <Delay>
                <Skeleton />
              </Delay>
            )}
          </div>
        );
      })}
    </div>
  );
}
