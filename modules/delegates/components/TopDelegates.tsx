/*

SPDX-FileCopyrightText: © 2023 Dai Foundation <www.daifoundation.org>

SPDX-License-Identifier: AGPL-3.0-or-later

*/

import BigNumber from 'lib/bigNumberJs';
import { Card, Box, Text, Flex, Button, Heading, Container, Divider } from 'theme-ui';
import { InternalLink } from 'modules/app/components/InternalLink';
import { Delegate } from '../types';
import Stack from 'modules/app/components/layout/layouts/Stack';
import { useState } from 'react';
import { DelegateModal } from './modals/DelegateModal';
import { DelegatePicture } from './DelegatePicture';

type TopCvc = {
  cvc_name?: string;
  mkrDelegated?: string;
};

export default function TopDelegates({
  delegates,
  topCvcs,
  totalMKRDelegated
}: {
  delegates: Delegate[];
  topCvcs: TopCvc[];
  totalMKRDelegated: BigNumber;
}): React.ReactElement {
  const [showDelegateModal, setShowDelegateModal] = useState<Delegate | null>(null);

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
          <Heading as="h2">Top Constitutional Voting Committees</Heading>
          <Text as="p" sx={{ color: 'textSecondary', px: 'inherit', fontSize: [2, 4] }}>
            Constitutional Voting Committees ranking by their voting power
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
          <Box sx={{ width: ['25%', '20%'] }}>
            <Text as="p" variant="caps" sx={{ color: 'secondaryEmphasis' }}>
              CVC Name
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
        {topCvcs?.map(({ cvc_name, mkrDelegated }, index) => {
          const cvcDelegate = delegates.find(delegate => delegate.cvc_name === cvc_name);
          return (
            <Box key={`top-delegate-${index}`} data-testid="top-constitutional-delegate">
              <Flex
                sx={{
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  mt: 3,
                  mb: 3
                }}
              >
                <Flex sx={{ width: ['70%', '20%'], alignItems: 'center' }}>
                  <Text pr={2} sx={{ display: ['none', 'block'] }}>
                    {index + 1}
                  </Text>
                  {cvcDelegate ? (
                    <InternalLink
                      href={'/delegates'}
                      title="View delegates"
                      queryParams={{ cvc: cvcDelegate.cvc_name || '' }}
                    >
                      <Flex sx={{ alignItems: 'center', gap: 2 }}>
                        <DelegatePicture delegate={cvcDelegate} />
                        <Text sx={{ color: 'primary', fontWeight: 'semiBold' }}>{cvc_name}</Text>
                      </Flex>
                    </InternalLink>
                  ) : (
                    <Text>{cvc_name}</Text>
                  )}
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
                      ? new BigNumber(mkrDelegated).div(totalMKRDelegated).multipliedBy(100).toFixed(2)
                      : '0.00'}
                    %
                  </Text>
                  {/* <Box sx={{ display: ['block', 'none'] }}>
                    <Icon name="chevron_down" size={2} ml={2} />
                  </Box> */}
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
                  <Text as="p">{mkrDelegated ? parseFloat(mkrDelegated).toFixed(2) : '0.00'} MKR </Text>
                  {cvcDelegate && (
                    <InternalLink
                      href={'/delegates'}
                      title="View delegates"
                      queryParams={{ cvc: cvcDelegate.cvc_name || '' }}
                      styles={{
                        borderColor: 'secondaryMuted',
                        color: 'text',
                        ':hover': {
                          color: 'text',
                          borderColor: 'onSecondary',
                        }
                      }}
                    >
                      <Button variant="outline">Delegate</Button>
                    </InternalLink>
                  )}
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
            <InternalLink href={'/account'} title="View account">
              <Button
                variant="outline"
                sx={{
                  borderColor: 'secondaryMuted',
                  color: 'text',
                  ':hover': {
                    color: 'text',
                    borderColor: 'onSecondary',
                    backgroundColor: 'background'
                  }
                }}
              >
                Become a delegate
              </Button>
            </InternalLink>
          </Box>
        </Flex>
      </Card>
    </Box>
  );
}
