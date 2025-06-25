/*

SPDX-FileCopyrightText: © 2023 Dai Foundation <www.daifoundation.org>

SPDX-License-Identifier: AGPL-3.0-or-later

*/

import React from 'react';
import { Card, Flex, Box, Button, ThemeUIStyleObject, Badge, Divider } from 'theme-ui';
import CountdownTimer from 'modules/app/components/CountdownTimer';
import { ExternalLink } from 'modules/app/components/ExternalLink';
import { useBreakpointIndex } from '@theme-ui/match-media';
import { PollCategoryTag } from './PollCategoryTag';
import PollWinningOptionBox from './PollWinningOptionBox';
import { formatDateWithTime } from 'lib/datetime';
import { CardTitle } from 'modules/app/components/Card/CardTitle';
import { CardHeader } from 'modules/app/components/Card/CardHeader';
import { CardSummary } from 'modules/app/components/Card/CardSummary';
import { ErrorBoundary } from 'modules/app/components/ErrorBoundary';
import { PollVoteTypeIndicator } from './PollOverviewCard/PollVoteTypeIndicator';
import { TagCount } from 'modules/app/types/tag';

// Sky poll types based on the API response structure
export type SkyPoll = {
  pollId: number;
  startDate: string;
  endDate: string;
  multiHash: string;
  slug: string;
  url: string;
  discussionLink: string;
  type: string;
  parameters: {
    inputFormat: {
      type: string;
      abstain: number[];
      options: any[];
    };
    victoryConditions: any[];
    resultDisplay: string;
  };
  title: string;
  summary: string;
  options: any[];
  tags: string[];
  tally?: {
    parameters: {
      victoryConditions: any[];
    };
    results: Array<{
      optionId: number;
      mkrSupport: string;
      firstPct: number;
    }>;
    totalMkrParticipation: string;
    winner: number | null;
    winningOption: string | null;
    numVoters: number;
    voteBreakdown: any[];
    victoryConditionMatched?: number;
  };
};

type Props = {
  poll: SkyPoll;
  allTags: TagCount[];
  sx?: ThemeUIStyleObject;
  hideTally?: boolean;
};

const isActivePoll = (poll: SkyPoll): boolean => {
  return new Date(poll.endDate) > new Date();
};

const getSkyPortalPollUrl = (poll: SkyPoll): string => {
  return `https://vote.sky.money/polling/${poll.slug}`;
};

const SkyPollOverviewCard = function SkyPollOverviewCard({
  poll,
  allTags,
  hideTally = false
}: Props): JSX.Element {
  const bpi = useBreakpointIndex({ defaultIndex: 2 });
  const isActive = isActivePoll(poll);

  return (
    <Card
      data-testid="sky-poll-overview-card"
      aria-label="Sky poll overview"
      sx={{
        p: [0, 0],
        border: '1px solid',
        borderColor: 'muted',
        position: 'relative'
      }}
    >
      <ErrorBoundary componentName="Sky Poll Card">
        {/* Sky badge indicator */}
        <Badge
          variant="primary"
          sx={{
            position: 'absolute',
            top: 2,
            right: 2,
            fontSize: 0,
            px: 2,
            py: 1,
            bg: 'primary',
            color: 'onPrimary'
          }}
        >
          Sky Governance
        </Badge>

        <Flex sx={{ flexDirection: 'column', height: '100%', justifyContent: 'space-between' }}>
          <Box
            sx={{
              px: [3, 4],
              py: 3,
              pt: 5, // Extra padding for badge
              display: 'flex',
              flexDirection: 'column',
              height: '100%',
              justifyContent: 'space-between'
            }}
          >
            <Flex
              sx={{
                flexDirection: 'row',
                justifyContent: 'space-between',
                minHeight: ['auto', 210],
                height: '100%'
              }}
            >
              <Flex
                sx={{
                  flexDirection: 'column',
                  width: '100%',
                  height: '100%',
                  justifyContent: 'space-between'
                }}
              >
                <Box>
                  {bpi === 0 && (
                    <Box sx={{ justifyContent: 'space-between', flexDirection: 'row', flexWrap: 'nowrap' }}>
                      <CountdownTimer endText="Poll ended" endDate={new Date(poll.endDate)} />
                    </Box>
                  )}
                  <Box>
                    <Box>
                      <CardHeader
                        text={`Posted ${formatDateWithTime(new Date(poll.startDate))} | Poll ID ${poll.pollId}`}
                        styles={{ mb: 2 }}
                      />
                      <ExternalLink href={getSkyPortalPollUrl(poll)} title="View poll details on Sky Portal">
                        <CardTitle
                          title={poll.title}
                          dataTestId="sky-poll-overview-card-poll-title"
                        />
                      </ExternalLink>
                    </Box>
                    <ExternalLink href={getSkyPortalPollUrl(poll)} title="View poll details on Sky Portal">
                      <CardSummary text={poll.summary} styles={{ my: 2 }} />
                    </ExternalLink>
                  </Box>

                  <Flex sx={{ flexWrap: 'wrap' }}>
                    {poll.tags.map(tag => (
                      <Box key={tag} sx={{ marginRight: 2, marginBottom: 2 }}>
                        <PollCategoryTag tag={tag} allTags={allTags} disableTagFilter={true} />
                      </Box>
                    ))}
                  </Flex>
                </Box>
                {bpi > 0 && (
                  <Flex mt={3} sx={{ gap: 2, alignItems: 'center', flexWrap: 'wrap' }}>
                    <Box>
                      <ErrorBoundary componentName="Countdown Timer">
                        <CountdownTimer endText="Poll ended" endDate={new Date(poll.endDate)} />
                      </ErrorBoundary>
                    </Box>
                  </Flex>
                )}
              </Flex>
            </Flex>

            <Box>
              <Flex
                sx={{
                  alignItems: 'flex-end',
                  mt: 2,
                  justifyContent: 'space-between',
                  flexDirection: ['column', 'row']
                }}
              >
                <Flex
                  sx={{
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    width: bpi > 0 ? 'auto' : '100%',
                    gap: 2,
                    p: 0
                  }}
                >
                  <ExternalLink href={getSkyPortalPollUrl(poll)} title="View poll details on Sky Portal">
                    <Button variant="outline">
                      View Details
                    </Button>
                  </ExternalLink>

                  {isActive && (
                    <ExternalLink href={getSkyPortalPollUrl(poll)} title="Vote on Sky Portal">
                      <Button variant="primary">
                        Vote on Sky Portal
                      </Button>
                    </ExternalLink>
                  )}

                  {bpi === 0 && <PollVoteTypeIndicator poll={poll as any} />}
                </Flex>

                {!hideTally && poll.tally && (
                  <Box sx={{ width: bpi > 0 ? '265px' : '100%', mt: [3, 0] }}>
                    <ErrorBoundary componentName="Poll Results">
                      <Box sx={{ 
                        p: 2, 
                        bg: 'surface', 
                        borderRadius: 'small',
                        fontSize: 1
                      }}>
                        <Box sx={{ mb: 1, fontWeight: 'bold' }}>
                          Poll Results
                        </Box>
                        <Box sx={{ color: 'textSecondary' }}>
                          Participants: {poll.tally.numVoters}
                        </Box>
                        <Box sx={{ color: 'textSecondary' }}>
                          Total MKR: {poll.tally.totalMkrParticipation}
                        </Box>
                      </Box>
                    </ErrorBoundary>
                  </Box>
                )}
              </Flex>
            </Box>
          </Box>

          {poll.tally && poll.tally.results && poll.tally.results.length > 0 && poll.tally.results[0].mkrSupport && (
            <Flex sx={{ flexDirection: 'column', justifySelf: 'flex-end' }}>
              <Divider my={0} />
              <ErrorBoundary componentName="Poll Winning Option">
                <PollWinningOptionBox tally={poll.tally as any} poll={poll as any} />
              </ErrorBoundary>
            </Flex>
          )}
        </Flex>
      </ErrorBoundary>
    </Card>
  );
};

export default SkyPollOverviewCard;