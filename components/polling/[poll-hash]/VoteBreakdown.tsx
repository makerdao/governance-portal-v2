/** @jsx jsx */
import { Box, Text, Progress, Flex, jsx } from 'theme-ui';
import Skeleton from 'react-loading-skeleton';
import Tooltip from '@reach/tooltip';

import Delay from '../../../components/Delay';
import PollTally from '../../../types/pollTally';
import Poll from '../../../types/poll';

export default function ({
  poll,
  shownOptions,
  tally,
  ...props
}: {
  poll: Poll;
  shownOptions: number;
  tally: PollTally | undefined;
}) {
  if (poll.voteType === 'Ranked Choice IRV') {
    return (
      <div key={2} sx={{ p: [3, 4] }} {...props}>
        <Text variant="microHeading" sx={{ mb: 3 }}>
          Vote Breakdown
        </Text>
        {Object.keys(poll.options)
          .slice(0, shownOptions)
          .map((_, i) => (
            <div key={i}>
              <Flex sx={{ justifyContent: 'space-between' }}>
                <Text sx={{ color: 'textSecondary', width: '20%' }}>
                  {tally ? (
                    tally.results[i].optionName
                  ) : (
                    <Delay>
                      <Skeleton />
                    </Delay>
                  )}
                </Text>
                <Text sx={{ color: 'textSecondary', width: tally ? 'unset' : '30%' }}>
                  {tally ? (
                    `${tally.results[i].firstChoice
                      .add(tally.results[i].transfer)
                      .toBigNumber()
                      .toFormat(2)} MKR Voting (${tally.results[i].firstPct
                      .plus(tally.results[i].transferPct)
                      .toFixed(2)}%)`
                  ) : (
                    <Delay>
                      <Skeleton />
                    </Delay>
                  )}
                </Text>
              </Flex>

              {tally ? (
                <Box sx={{ position: 'relative', mb: 4 }}>
                  <Tooltip label={`First choice ${tally.results[i].firstChoice.toBigNumber().toFormat(2)}`}>
                    <Box my={2}>
                      <Progress
                        sx={{ backgroundColor: 'muted', color: 'primary', zIndex: 2, position: 'absolute' }}
                        max={tally.totalMkrParticipation.toBigNumber()}
                        value={tally.results[i].firstChoice.toBigNumber()}
                      />
                    </Box>
                  </Tooltip>
                  <Tooltip label={`Transfer ${tally.results[i].transfer.toBigNumber().toFormat(2)}`}>
                    <Box my={2}>
                      <Progress
                        sx={{
                          backgroundColor: 'muted',
                          color: 'primaryMuted',
                          zIndex: 1,
                          position: 'absolute'
                        }}
                        max={tally.totalMkrParticipation.toBigNumber()}
                        value={tally.results[i].firstChoice.add(tally.results[i].transfer).toBigNumber()}
                      />
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
      </div>
    );
  }

  return (
    <div key={2} sx={{ p: [3, 4] }} {...props}>
      <Text variant="microHeading" sx={{ mb: 3 }}>
        Vote Breakdown
      </Text>
      {Object.keys(poll.options)
        .slice(0, shownOptions)
        .map((_, i) => (
          <div key={i}>
            <Flex sx={{ justifyContent: 'space-between' }}>
              <Text sx={{ color: 'textSecondary', width: '20%' }}>
                {tally ? (
                  tally.results[i].optionName
                ) : (
                  <Delay>
                    <Skeleton />
                  </Delay>
                )}
              </Text>
              <Text sx={{ color: 'textSecondary', width: tally ? 'unset' : '30%' }}>
                {tally ? (
                  `${tally.results[i].firstChoice
                    .add(tally.results[i].transfer)
                    .toBigNumber()
                    .toFormat(2)} MKR Voting (${tally.results[i].firstPct.toFixed(2)}%)`
                ) : (
                  <Delay>
                    <Skeleton />
                  </Delay>
                )}
              </Text>
            </Flex>

            {tally ? (
              <Tooltip label={`First choice ${tally.results[i].firstChoice.toBigNumber().toFormat(2)}`}>
                <Box my={2}>
                  <Progress
                    sx={{ backgroundColor: 'muted', mb: '3' }}
                    max={tally.totalMkrParticipation.toBigNumber()}
                    value={tally.results[i].firstChoice.toBigNumber()}
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
