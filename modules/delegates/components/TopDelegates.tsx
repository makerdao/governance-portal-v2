/*

SPDX-FileCopyrightText: © 2023 Dai Foundation <www.daifoundation.org>

SPDX-License-Identifier: AGPL-3.0-or-later

*/

import { Card, Box, Text, Flex, Button, Heading, Container, Divider } from 'theme-ui';
import { InternalLink } from 'modules/app/components/InternalLink';
import Stack from 'modules/app/components/layout/layouts/Stack';
import { DelegatePicture } from './DelegatePicture';
import { DelegatePaginated } from '../types';
import { DelegateModal } from './modals/DelegateModal';
import { useState } from 'react';
import { useAccount } from 'modules/app/hooks/useAccount';
import { calculatePercentage } from 'lib/utils';
import { parseEther } from 'viem';
import { config } from 'lib/config';

export default function TopDelegates({
  topDelegates,
  totalMKRDelegated
}: {
  topDelegates: DelegatePaginated[];
  totalMKRDelegated: bigint;
}): React.ReactElement {
  const { account } = useAccount();
  const [showDelegateModal, setShowDelegateModal] = useState<DelegatePaginated | null>(null);

  return (
    <Box>
      {showDelegateModal && (
        <DelegateModal
          title={`Delegate to ${showDelegateModal.name}`}
          delegate={showDelegateModal}
          isOpen={true}
          onDismiss={() => setShowDelegateModal(null)}
          mutateTotalStaked={() => null}
          mutateMKRDelegated={() => null}
        />
      )}
      <Container sx={{ textAlign: 'center', maxWidth: 'title', mb: 4 }}>
        <Stack gap={2}>
          <Heading as="h2">Top Aligned Delegates</Heading>
          <Text as="p" sx={{ color: 'textSecondary', px: 'inherit', fontSize: [2, 4] }}>
            Aligned Delegates ranked by their voting power
          </Text>
        </Stack>
      </Container>
      <Card
        sx={{
          p: [2, 4],
          maxWidth: '926px',
          margin: '0 auto'
        }}
      >
        <Flex
          sx={{
            justifyContent: 'space-between'
          }}
        >
          <Box sx={{ width: ['25%', '40%'] }}>
            <Text as="p" variant="caps" sx={{ color: 'secondaryEmphasis' }}>
              Name
            </Text>
          </Box>
          <Box sx={{ width: ['50%', '15%'], textAlign: ['right', 'left'] }}>
            <Text as="p" variant="caps" sx={{ color: 'secondaryEmphasis' }}>
              Voting Power
            </Text>
          </Box>
          <Box sx={{ width: '30%', textAlign: 'left', display: ['none', 'block'] }}>
            <Text as="p" variant="caps" sx={{ color: 'secondaryEmphasis' }}>
              MKR
            </Text>
          </Box>
        </Flex>
        {topDelegates?.map((delegate, index) => {
          const { name, voteDelegateAddress, mkrDelegated } = delegate;
          return (
            <Box key={`top-delegate-${index}`} data-testid="top-aligned-delegate">
              <Flex
                sx={{
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  mt: 3,
                  mb: 3
                }}
              >
                <Flex sx={{ width: ['70%', '40%'], alignItems: 'center' }}>
                  <Text pr={2} sx={{ display: ['none', 'block'] }}>
                    {index + 1}
                  </Text>
                  <InternalLink href={`/address/${voteDelegateAddress}`} title="View delegates">
                    <Flex sx={{ alignItems: 'center', gap: 2 }}>
                      <DelegatePicture delegate={delegate} showTooltip={false} />
                      <Text sx={{ color: 'primary', fontWeight: 'semiBold' }}>{name}</Text>
                    </Flex>
                  </InternalLink>
                </Flex>
                <Flex
                  sx={{
                    width: ['30%', '15%'],
                    textAlign: ['right', 'left'],
                    justifyContent: ['flex-end', 'flex-start']
                  }}
                >
                  <Text>
                    {mkrDelegated
                      ? calculatePercentage(parseEther(mkrDelegated), totalMKRDelegated, 2).toString()
                      : '0.00'}
                    %
                  </Text>
                </Flex>
                <Flex
                  sx={{
                    width: '30%',
                    textAlign: 'right',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    display: ['none', 'flex']
                  }}
                >
                  <Text as="p">{mkrDelegated ? parseFloat(mkrDelegated).toFixed(2) : '0.00'} MKR</Text>
                  <Button
                    variant="outline"
                    data-testid="button-delegate"
                    disabled={config.READ_ONLY || !account}
                    onClick={() => {
                      setShowDelegateModal(delegate);
                    }}
                    sx={{
                      borderColor: 'secondaryMuted',
                      color: 'text',
                      ':hover': {
                        color: 'text',
                        borderColor: 'onSecondary'
                      }
                    }}
                  >
                    Delegate
                  </Button>
                </Flex>
              </Flex>
            </Box>
          );
        })}

        <Divider />

        <Flex
          sx={{
            mt: 4,
            alignItems: 'center',
            justifyContent: 'center'
          }}
        >
          <Box
            sx={{
              ml: [0, 3],
              mr: [2, 3]
            }}
          >
            <InternalLink
              href={'/delegates'}
              title="View delegates"
              styles={{
                borderColor: 'secondaryMuted',
                color: 'text',
                ':hover': {
                  color: 'text',
                  borderColor: 'onSecondary',
                  backgroundColor: 'background'
                }
              }}
            >
              <Button variant="outline">Find a delegate</Button>
            </InternalLink>
          </Box>
          <Box
            sx={{
              ml: [2, 3],
              mr: [0, 3]
            }}
          >
            <InternalLink
              href={'/account'}
              title="View account"
              styles={{
                borderColor: 'secondaryMuted',
                color: 'text',
                ':hover': {
                  color: 'text',
                  borderColor: 'onSecondary',
                  backgroundColor: 'background'
                }
              }}
            >
              <Button variant="outline">Become a delegate</Button>
            </InternalLink>
          </Box>
        </Flex>
      </Card>
    </Box>
  );
}
