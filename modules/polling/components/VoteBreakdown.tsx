/** @jsx jsx */
import { Box, Text, Progress, Flex, jsx } from 'theme-ui';
import Skeleton from 'components/SkeletonThemed';
import Tooltip from 'components/Tooltip';

import Delay from 'components/Delay';
import { PollTally, Poll } from 'modules/polling/types';
import { POLL_VOTE_TYPE } from '../polls.constants';

export default function VoteBreakdown({
  poll,
  shownOptions,
  tally
}: {
  poll: Poll;
  shownOptions: number;
  tally: PollTally | undefined;
}): JSX.Element {
  if (poll.voteType === POLL_VOTE_TYPE.RANKED_VOTE) {
    return (
      <Box key={2} sx={{ p: [3, 4] }}>
        <Text variant="microHeading" sx={{ display: 'block', mb: 3 }}>
          Vote Breakdown
        </Text>
        {Object.keys(poll.options)
          .slice(0, shownOptions)
          .map((_, i) => (
            <div key={i}>
              <Flex sx={{ justifyContent: 'space-between' }}>
                {tally ? (
                  <Text as="p" sx={{ color: 'textSecondary', width: '20%', mr: 2 }}>
                    {tally.results[i].optionName}
                  </Text>
                ) : (
                  <Delay>
                    <Skeleton />
                  </Delay>
                )}
                {tally ? (
                  <Text as="p" sx={{ color: 'textSecondary', width: tally ? 'unset' : '30%' }}>
                    {`${tally.results[i].firstChoice
                      .plus(tally.results[i].transfer)
                      .toFormat(2)} MKR Voting ($${tally.results[i].firstPct
                      .plus(tally.results[i].transferPct)
                      .toFixed(2)}%)`}
                  </Text>
                ) : (
                  <Delay>
                    <Skeleton />
                  </Delay>
                )}
              </Flex>

              {tally ? (
                <Box sx={{ position: 'relative', mb: 4 }}>
                  <Tooltip
                    label={`First choice ${tally.results[i].firstChoice.toFormat(
                      2
                    )}; Transfer ${tally.results[i].transfer.toFormat(2)}`}
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
                            tally.results[i].transfer.lt(0)
                              ? tally.results[i].firstChoice.toNumber()
                              : tally.results[i].firstChoice.plus(tally.results[i].transfer).toNumber()
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
                            tally.results[i].transfer.lt(0)
                              ? tally.results[i].firstChoice.plus(tally.results[i].transfer).toNumber()
                              : tally.results[i].firstChoice.toNumber()
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
          ))}
      </Box>
    );
  }

  return (
    <div key={2} sx={{ p: [3, 4], fontSize: [2, 3] }}>
      <Text variant="microHeading" sx={{ display: 'block', mb: 3 }}>
        Vote Breakdown
      </Text>
      {Object.keys(poll.options)
        .slice(0, shownOptions)
        .map((_, i) => (
          <div key={i}>
            <Flex sx={{ justifyContent: 'space-between' }}>
              {tally ? (
                <Text as="p" sx={{ color: 'textSecondary', width: '20%', mr: 2 }}>
                  {tally.results[i].optionName}
                </Text>
              ) : (
                <Delay>
                  <Skeleton />
                </Delay>
              )}
              {tally ? (
                <Text as="p" sx={{ color: 'textSecondary', width: tally ? 'unset' : '30%' }}>
                  {`${tally.results[i].firstChoice
                    .plus(tally.results[i].transfer)
                    .toFormat(2)} MKR Voting (${tally.results[i].firstPct.toFixed(2)}%)`}
                </Text>
              ) : (
                <Delay>
                  <Skeleton />
                </Delay>
              )}
            </Flex>

            {tally ? (
              <Tooltip label={`First choice ${tally.results[i].firstChoice.toFormat(2)}`}>
                <Box my={2}>
                  <Progress
                    sx={{ backgroundColor: 'muted', mb: '3', height: 2 }}
                    max={tally.totalMkrParticipation.toBigNumber()}
                    value={tally.results[i].firstChoice.toNumber()}
                  />
                </Box>
              </Tooltip>
            ) : (
              <Delay>
                <Skeleton />
              </Delay>
            )}
          </div>
        ))}
    </div>
  );
}
