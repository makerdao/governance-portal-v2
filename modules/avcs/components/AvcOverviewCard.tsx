/*

SPDX-FileCopyrightText: © 2023 Dai Foundation <www.daifoundation.org>

SPDX-License-Identifier: AGPL-3.0-or-later

*/

import { memo } from 'react';
import { Avc } from '../types/avc';
import { Box, Button, Card, Flex, Text } from 'theme-ui';
import AvcAvatarName from './AvcAvatarName';
import { InternalLink } from 'modules/app/components/InternalLink';
import { formatValue } from 'lib/string';
import { parseEther } from 'ethers/lib/utils';

const extractShortDescription = (description: string) => {
  const characterLimit = 500;

  const shortDescription = description
    // RegExp to remove all HTML tags
    .replace(/<\/?.+?>/gi, '')
    .split('\n')
    .slice(1)
    .filter(line => line !== '')
    .join('\n\n');

  const isDescriptionLonger = shortDescription.length > characterLimit;
  return `${shortDescription.slice(0, characterLimit)}${isDescriptionLonger ? '...' : ''}`;
};

export const AvcOverviewCard = memo(function AvcOverviewCard({ avc }: { avc: Avc }): React.ReactElement {
  return (
    <Card p={[3, 3, 3, 4]} data-testid="avc-card">
      <Flex sx={{ flexDirection: 'column', gap: 4 }}>
        <Flex
          sx={{
            flexDirection: ['column', 'row'],
            alignItems: ['flex-start', 'center'],
            justifyContent: 'space-between',
            gap: 2
          }}
        >
          <AvcAvatarName avc={avc} />
          {avc.delegateCount > 0 ? (
            <InternalLink href="/delegates" queryParams={{ avc: avc.name }} title="View delegates">
              <Button variant="primaryLarge" data-testid="button-avc-view-delegates">
                View Delegates
              </Button>
            </InternalLink>
          ) : (
            <></>
          )}
        </Flex>

        <Text variant="secondary" sx={{ whiteSpace: 'pre-line' }}>
          {extractShortDescription(avc.description)}
        </Text>

        <Flex sx={{ justifyContent: 'flex-end', flexWrap: 'wrap-reverse' }}>
          <Flex sx={{ justifyContent: 'flex-end', gap: 4 }}>
            <Box>
              <Text
                as="p"
                variant="microHeading"
                sx={{ fontSize: [3, 5], textAlign: ['left', 'right'] }}
                data-testid="avc-delegates-count"
              >
                {avc.delegateCount}
              </Text>
              <Text
                as="p"
                variant="secondary"
                color="onSecondary"
                sx={{ textAlign: 'right', fontSize: [1, 2, 3] }}
              >
                Delegates
              </Text>
            </Box>
            <Box>
              <Text
                as="p"
                variant="microHeading"
                sx={{ fontSize: [3, 5], textAlign: ['left', 'right'] }}
                data-testid="avc-total-mkr-delegated"
              >
                {formatValue(parseEther(avc.mkrDelegated))}
              </Text>
              <Text
                as="p"
                variant="secondary"
                color="onSecondary"
                sx={{ textAlign: 'right', fontSize: [1, 2, 3] }}
              >
                Total MKR delegated
              </Text>
            </Box>
          </Flex>
        </Flex>
      </Flex>
    </Card>
  );
});
