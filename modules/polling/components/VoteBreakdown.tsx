 
import { Box, Text, Progress, Flex, jsx } from 'theme-ui';
import Skeleton from 'modules/app/components/SkeletonThemed';
import Tooltip from 'modules/app/components/Tooltip';
import Delay from 'modules/app/components/Delay';
import { PollTally, Poll, RankedChoiceResult, PluralityResult } from 'modules/polling/types';
import { POLL_VOTE_TYPE } from 'modules/polling/polling.constants';
import { getVoteColor } from 'modules/polling/helpers/getVoteColor';

export default function VoteBreakdown({
  poll,
  shownOptions,
  tally
}: {
  poll: Poll;
  shownOptions: number;
  tally: PollTally | undefined;
}): JSX.Element {
  if (poll.voteType === (POLL_VOTE_TYPE.RANKED_VOTE || POLL_VOTE_TYPE.UNKNOWN)) {
    return (
      <Box key={2} sx={{ p: [3, 4] }}>
        <Text variant="microHeading" sx={{ display: 'block', mb: 3 }}>
          Vote Breakdown
        </Text>
        {Object.keys(poll.options)
          .slice(0, shownOptions)
          .map((_, i) => {
            const tallyResult = tally?.results[i] as RankedChoiceResult;
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
                  {tallyResult ? (
                    <Text as="p" sx={{ color: 'textSecondary', width: tally ? 'unset' : '30%' }}>
                      {`${tallyResult.firstChoice
                        .plus(tallyResult.transfer)
                        .toFormat(2)} MKR Voting (${tallyResult.firstPct
                        .plus(tallyResult.transferPct)
                        .toFixed(2)}%)`}
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
                      label={`First choice ${tallyResult.firstChoice.toFormat(
                        2
                      )}; Transfer ${tallyResult.transfer.toFormat(2)}`}
                    >
                      <Box my={2}>
                        <Box>
                          <Progress
                            sx={{
                              backgroundColor: 'muted',
                              height: 2,
                              color: 'mutedAlt',
                              position: 'absolute'
                            }}
                            max={tally.totalMkrParticipation.toBigNumber()}
                            value={
                              tallyResult.transfer.lt(0)
                                ? tallyResult.firstChoice.toNumber()
                                : tallyResult.firstChoice.plus(tallyResult.transfer).toNumber()
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
                            max={tally.totalMkrParticipation.toBigNumber()}
                            value={
                              tallyResult.transfer.lt(0)
                                ? tallyResult.firstChoice.plus(tallyResult.transfer).toNumber()
                                : tallyResult.firstChoice.toNumber()
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
                <Text as="p" sx={{ color: 'textSecondary', width: tally ? 'unset' : '30%' }}>
                  {`${tallyResult.mkrSupport.toFormat(2)} MKR Voting (${tallyResult.firstPct.toFixed(2)}%)`}
                </Text>
              ) : (
                <Delay>
                  <Skeleton />
                </Delay>
              )}
            </Flex>

            {tally && tallyResult ? (
              <Tooltip label={`First choice ${tallyResult.mkrSupport.toFormat(2)}`}>
                <Box my={2}>
                  <Progress
                    sx={{
                      backgroundColor: 'muted',
                      mb: '3',
                      height: 2,
                      color: getVoteColor(parseInt(tallyResult.optionId), poll.voteType)
                    }}
                    max={tally.totalMkrParticipation.toBigNumber()}
                    value={tallyResult.mkrSupport.toNumber()}
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
