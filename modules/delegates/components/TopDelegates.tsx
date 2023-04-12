/*

SPDX-FileCopyrightText: © 2023 Dai Foundation <www.daifoundation.org>

SPDX-License-Identifier: AGPL-3.0-or-later

*/

import BigNumber from 'lib/bigNumberJs';
import { Card, Box, Text, Flex, Button, Heading, Container, Divider } from 'theme-ui';
import { InternalLink } from 'modules/app/components/InternalLink';
import Stack from 'modules/app/components/layout/layouts/Stack';
import { CvcStats } from '../types/cvc';
// import { DelegatePicture } from './DelegatePicture';

export default function TopDelegates({
  topCvcs,
  totalMKRDelegated
}: {
  topCvcs: CvcStats[];
  totalMKRDelegated: BigNumber;
}): React.ReactElement {
  return (
    <Box>
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
                  <InternalLink href={'/delegates'} title="View delegates" queryParams={{ cvc: cvc_name }}>
                    <Flex sx={{ alignItems: 'center', gap: 2 }}>
                      {/* <DelegatePicture delegate={cvcDelegate} showTooltip={false} /> */}
                      <Text sx={{ color: 'primary', fontWeight: 'semiBold' }}>{cvc_name}</Text>
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
                      ? new BigNumber(mkrDelegated).div(totalMKRDelegated).multipliedBy(100).toFixed(2)
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
                  <Text as="p">{mkrDelegated ? mkrDelegated.toFixed(2) : '0.00'} MKR </Text>
                  <InternalLink
                    href={'/delegates'}
                    title="View delegates"
                    queryParams={{ cvc: cvc_name }}
                    styles={{
                      borderColor: 'secondaryMuted',
                      color: 'text',
                      ':hover': {
                        color: 'text',
                        borderColor: 'onSecondary'
                      }
                    }}
                  >
                    <Button variant="outline">Delegate</Button>
                  </InternalLink>
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
