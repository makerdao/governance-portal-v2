import { Box, Text, Progress, Flex } from 'theme-ui';
import Skeleton from 'modules/app/components/SkeletonThemed';
import Tooltip from 'modules/app/components/Tooltip';
import Delay from 'modules/app/components/Delay';
import { PollTally, Poll } from 'modules/polling/types';
import { getVoteColor } from 'modules/polling/helpers/getVoteColor';
import { BigNumberJS } from 'lib/bigNumberJs';
import { formatValue } from 'lib/string';
import { parseUnits } from 'ethers/lib/utils';
import {
  isResultDisplayApprovalBreakdown,
  isResultDisplayInstantRunoffBreakdown,
  isResultDisplaySingleVoteBreakdown
} from '../helpers/utils';
import { PollVoteTypeIndicator } from './PollOverviewCard/PollVoteTypeIndicator';
import React from 'react';

export default function VoteBreakdown({
  poll,
  shownOptions,
  tally
}: {
  poll: Poll;
  shownOptions: number;
  tally: PollTally | undefined;
}): JSX.Element {
  return (
    <Box key={2} sx={{ p: [3, 4] }} data-testid="vote-breakdown">
      <Flex sx={{ flexDirection: ['column', 'row'], justifyContent: 'space-between' }}>
        <Text variant="microHeading" sx={{ display: 'block', mb: 3 }}>
          Vote Breakdown
        </Text>
        <Box sx={{ mb: 3 }}>
          <PollVoteTypeIndicator poll={poll} />
          {isResultDisplayInstantRunoffBreakdown(poll.parameters) && (
            <Text as="p" variant="caps" sx={{ textAlign: 'left' }}>
              Rounds {tally?.rounds}
            </Text>
          )}
        </Box>
      </Flex>
      {isResultDisplayApprovalBreakdown(poll.parameters) &&
        Object.keys(poll.options).map((_, i) => {
          const tallyResult = tally?.results.find(r => r.optionId === i);
          const mkrSupport = tally && tallyResult && tallyResult.mkrSupport ? tallyResult.mkrSupport : 0;

          return (
            <div key={i}>
              <Flex sx={{ justifyContent: 'space-between' }}>
                {tally && tallyResult ? (
                  <React.Fragment>
                    <Text as="p" sx={{ color: 'textSecondary', mr: 2 }}>
                      {tallyResult.optionName}
                    </Text>
                    <Text
                      as="p"
                      sx={{
                        color: 'textSecondary',
                        width: tally ? 'unset' : '30%',
                        textAlign: 'right'
                      }}
                    >
                      {`${formatValue(parseUnits(mkrSupport.toString()))} MKR Voting`}
                      {!isResultDisplayApprovalBreakdown(poll.parameters)
                        ? ` (${formatValue(parseUnits(tallyResult.firstPct.toString()))}%)`
                        : ''}
                    </Text>
                  </React.Fragment>
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
                        color: getVoteColor(tallyResult.optionId, poll.parameters)
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
      {isResultDisplayInstantRunoffBreakdown(poll.parameters) &&
        Object.keys(poll.options)
          .slice(0, shownOptions)
          .map((_, i) => {
            const tallyResult = tally?.results[i];
            const firstChoice = new BigNumberJS(tallyResult?.mkrSupport || 0);
            const transfer = new BigNumberJS(tallyResult?.transfer || 0);
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
                    <Text
                      as="p"
                      sx={{
                        color: 'textSecondary',
                        width: tally ? 'unset' : '30%',
                        textAlign: ['left', 'right']
                      }}
                    >
                      {`${formatValue(
                        parseUnits(firstChoice.plus(transfer).toString())
                      )} MKR Voting (${formatValue(
                        parseUnits(
                          new BigNumberJS(tallyResult.firstPct).plus(tallyResult?.transferPct || 0).toString()
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
                              color: `${transfer.lt(0) ? '#f57350' : 'darkPrimary'}`,
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
      {isResultDisplaySingleVoteBreakdown(poll.parameters) &&
        Object.keys(poll.options).map((_, i) => {
          const tallyResult = tally?.results[i];
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
                        color: getVoteColor(tallyResult.optionId, poll.parameters)
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
    </Box>
  );
}
