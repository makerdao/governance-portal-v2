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
import { formatValue } from 'lib/string';

export default function TopDelegates({
  topDelegates,
  totalSkyDelegated
}: {
  topDelegates: DelegatePaginated[];
  totalSkyDelegated: bigint;
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
          mutateSkyDelegated={() => null}
        />
      )}
      <Container sx={{ textAlign: 'center', maxWidth: 'title', mb: 4 }}>
        <Stack gap={2}>
          <Heading as="h2">Top Aligned Delegates</Heading>
          <Text as="p" sx={{ px: 'inherit', fontSize: [2, 4] }}>
            Aligned Delegates ranked by their voting power
          </Text>
        </Stack>
      </Container>
      <Card
        sx={{
          p: [3, 4],
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
              SKY
            </Text>
          </Box>
        </Flex>

        <Divider />

        {topDelegates?.length === 0 ? (
          <Box sx={{ textAlign: 'center', mt: 4, width: '100%' }}>
            <Text>No delegates found</Text>
          </Box>
        ) : (
          topDelegates?.map((delegate, index) => {
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
                        ? calculatePercentage(BigInt(mkrDelegated), totalSkyDelegated, 2).toString()
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
                    <Text as="p">{mkrDelegated ? formatValue(BigInt(mkrDelegated)) : '0.00'} SKY</Text>
                    <Button
                      variant="outline"
                      data-testid="button-delegate"
                      disabled={!account}
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
          })
        )}

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
