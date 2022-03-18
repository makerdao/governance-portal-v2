import BigNumber from 'bignumber.js';
import { parseUnits } from 'ethers/lib/utils';
import { formatValue } from 'lib/string';
import { Box, Text, Flex, Button, Heading, Container, Link as ThemeUILink, Divider } from 'theme-ui';
import { Delegate } from '../types';
import Stack from 'modules/app/components/layout/layouts/Stack';
import DelegateAvatarName from './DelegateAvatarName';
import Link from 'next/link';
import { useAnalytics } from 'modules/app/client/analytics/useAnalytics';
import { ANALYTICS_PAGES } from 'modules/app/client/analytics/analytics.constants';
import { useAccount } from 'modules/app/hooks/useAccount';
import { useState } from 'react';
import { DelegateModal } from './modals/DelegateModal';
import { Icon } from '@makerdao/dai-ui-icons';
import { formatDelegationHistory } from '../helpers/formatDelegationHistory';

export default function TopDelegates({
  delegates,
  totalMKRDelegated
}: {
  delegates: Delegate[];
  totalMKRDelegated: BigNumber;
}): React.ReactElement {
  const { trackButtonClick } = useAnalytics(ANALYTICS_PAGES.TOP_DELEGATES);

  const { account } = useAccount();
  const [showDelegateModal, setShowDelegateModal] = useState<Delegate | null>(null);
  const [toggledDelegates, setToggledDelegates] = useState({});

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
          <Heading as="h2">Top Delegates</Heading>
          <Text as="p" sx={{ color: 'textSecondary', px: 'inherit', fontSize: [2, 4] }}>
            Delegates ranking by their voting power
          </Text>
        </Stack>
      </Container>
      <Box
        sx={{
          border: ['none', '1px solid #D4D9E1'],
          borderRadius: '6px',
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
          <Box sx={{ width: '40%' }}>
            <Text as="p" variant="caps" sx={{ color: 'mutedAlt' }}>
              Address
            </Text>
          </Box>
          <Box sx={{ width: '15%', display: ['none', 'block'] }}>
            <Text as="p" variant="caps" sx={{ color: 'mutedAlt' }}>
              Delegators
            </Text>
          </Box>
          <Box sx={{ width: ['50%', '15%'], textAlign: ['right', 'left'] }}>
            <Text as="p" variant="caps" sx={{ color: 'mutedAlt' }}>
              Voting Power
            </Text>
          </Box>
          <Box sx={{ width: '30%', textAlign: 'center', display: ['none', 'block'] }}>
            <Text as="p" variant="caps" sx={{ color: 'mutedAlt' }}>
              MKR
            </Text>
          </Box>
        </Flex>
        {delegates.map((delegate, index) => {
          const delegationHistory = formatDelegationHistory(delegate.mkrLockedDelegate);
          return (
            <Box key={`top-delegate-${index}`}>
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
                  <Link
                    href={{
                      pathname: `/address/${delegate.voteDelegateAddress}`
                    }}
                    passHref
                  >
                    <ThemeUILink title="Profile details" variant="nostyle">
                      <DelegateAvatarName delegate={delegate} />
                    </ThemeUILink>
                  </Link>
                </Flex>
                <Box sx={{ width: '15%', display: ['none', 'block'] }}>
                  <Text>
                    {delegationHistory.filter(i => new BigNumber(i.lockAmount).gt(0)).length}{' '}
                    addresses
                  </Text>
                </Box>
                <Flex
                  sx={{ width: ['30%', '15%'], textAlign: ['right', 'left'], justifyContent: ['flex-end', 'flex-start'] }}
                  onClick={() => {
                    setToggledDelegates({
                      ...toggledDelegates,
                      [delegate.address]: !toggledDelegates[delegate.address]
                    });
                  }}
                >
                  <Text>
                    {new BigNumber(delegate.mkrDelegated).div(totalMKRDelegated).multipliedBy(100).toFixed(2)}
                    %
                  </Text>
                  <Box sx={{ display: ['block', 'none'] }}>
                    <Icon name="chevron_down" size={2} ml={2} />
                  </Box>
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
                  <Text as="p">{formatValue(parseUnits(delegate.mkrDelegated))} MKR </Text>
                  <Button
                    variant="outline"
                    data-testid="button-delegate"
                    disabled={!account}
                    onClick={() => {
                      trackButtonClick('openDelegateModal');
                      setShowDelegateModal(delegate);
                    }}
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
                    Delegate
                  </Button>
                </Flex>
              </Flex>
              {toggledDelegates[delegate.address] && (
                <Box
                  sx={{
                    display: ['block', 'none']
                  }}
                >
                  <Flex
                    sx={{
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      mt: 3,
                      mb: 3
                    }}
                  >
                    <Box sx={{ width: '50%' }}>
                      <Text as="p" variant="caps" sx={{ color: 'mutedAlt' }}>
                        Delegators
                      </Text>
                      <Text>
                        {delegationHistory.filter(i => new BigNumber(i.lockAmount).gt(0)).length}{' '}
                        addresses
                      </Text>
                    </Box>
                    <Box sx={{ width: '50%', textAlign: 'right' }}>
                      <Text as="p" variant="caps" sx={{ color: 'mutedAlt' }}>
                        MKR
                      </Text>
                      <Text as="p">{formatValue(parseUnits(delegate.mkrDelegated))} MKR </Text>
                    </Box>
                  </Flex>
                  <Flex mb={3} sx={{ justifyContent: 'center' }}>
                    <Button
                      variant="outline"
                      data-testid="button-delegate"
                      disabled={!account}
                      onClick={() => {
                        trackButtonClick('openDelegateModal');
                        setShowDelegateModal(delegate);
                      }}
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
                      Delegate your MKR to this Delegate
                    </Button>
                  </Flex>
                  <Divider />
                </Box>
              )}
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
            <Link
              href={{
                pathname: '/delegates'
              }}
              passHref
            >
              <ThemeUILink title="Profile details" variant="nostyle">
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
                  Find a delegate
                </Button>
              </ThemeUILink>
            </Link>
          </Box>
          <Box
            sx={{
              ml: [2, 3],
              mr: [0, 3]
            }}
          >
            <Link
              href={{
                pathname: '/account'
              }}
              passHref
            >
              <ThemeUILink title="Profile details" variant="nostyle">
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
              </ThemeUILink>
            </Link>
          </Box>
        </Flex>
      </Box>
    </Box>
  );
}
