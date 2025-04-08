/*

SPDX-FileCopyrightText: © 2023 Dai Foundation <www.daifoundation.org>

SPDX-License-Identifier: AGPL-3.0-or-later

*/

import { Box, Button, Card, Heading, Text } from 'theme-ui';
import PrimaryLayout from 'modules/app/components/layout/layouts/Primary';
import Stack from 'modules/app/components/layout/layouts/Stack';
import { HeadComponent } from 'modules/app/components/layout/Head';
import { useNetwork } from 'modules/app/hooks/useNetwork';
import { useAccount } from 'wagmi';
import AccountNotConnected from 'modules/web3/components/AccountNotConnected';
import { useMemo } from 'react';
import { useAddressDelegations } from 'modules/delegates/hooks/useAddressDelegations';
import { DelegateExpirationOverviewCard } from 'modules/migration/components/DelegateExpirationOverviewCard';
import Icon from 'modules/app/components/Icon';

import Link from 'next/link';
import PageLoadingPlaceholder from 'modules/app/components/PageLoadingPlaceholder';

export default function DelegateMigrationPage(): React.ReactElement {
  const network = useNetwork();
  const { address: account } = useAccount();

  const addressDelegations = useAddressDelegations(account, network);

  // List of delegates that are v1 and have been replaced by a v2, the user has to undelegate from them
  const delegatesThatAreV1WithMKRDelegated = useMemo(() => {
    if (!addressDelegations) {
      return [];
    }

    return addressDelegations.delegates.filter(delegate => {
      const delegatedToDelegate = addressDelegations.delegatedTo.find(
        i => i.address === delegate.voteDelegateAddress
      );

      if (!delegatedToDelegate || parseFloat(delegatedToDelegate.lockAmount) === 0) {
        return false;
      }
      return delegate.delegateVersion !== 2 && !!delegate.next;
    });
  }, [addressDelegations]);

  // Historical list of delegates that the user interacted with that are v1 and replaced by a v2 (no need to have current MKR delegated to them)
  const delegatesThatAreV1 = useMemo(() => {
    if (!addressDelegations) {
      return [];
    }

    return addressDelegations.delegates.filter(delegate => {
      const delegatedToDelegate = addressDelegations.delegatedTo.find(
        i => i.address === delegate.voteDelegateAddress
      );

      if (!delegatedToDelegate) {
        return false;
      }
      return delegate.delegateVersion !== 2 && !!delegate.next;
    });
  }, [addressDelegations]);

  // List of new delegates that can be renewed, the user has to delegate to them
  const delegatesThatAreNotV1 = useMemo(() => {
    if (!addressDelegations) {
      return [];
    }

    return addressDelegations.delegates.filter(delegate => delegate.delegateVersion === 2);
  }, [addressDelegations, delegatesThatAreV1]);

  // UI loading states
  const { isLoading, isEmpty } = useMemo(() => {
    const isLoading = !addressDelegations;
    const isEmpty = delegatesThatAreV1WithMKRDelegated.length === 0 && delegatesThatAreNotV1.length === 0;

    return {
      isLoading,
      isEmpty
    };
  }, [addressDelegations, delegatesThatAreV1WithMKRDelegated, delegatesThatAreNotV1]);

  return (
    <PrimaryLayout sx={{ maxWidth: 'dashboard' }}>
      <HeadComponent title="Migrate your MKR to a new delegate contract" />

      {!account && (
        <Box>
          <AccountNotConnected />
        </Box>
      )}

      {account && (
        <Box>
          {isLoading && (
            <Stack gap={4}>
              <PageLoadingPlaceholder />
            </Stack>
          )}
          {!isLoading && !isEmpty && (
            <Stack gap={4} sx={{ maxWidth: '950px', margin: '0 auto' }}>
              <Box>
                <Heading mb={2} as="h4" sx={{ textAlign: 'left', fontWeight: 'bold' }}>
                  Action required: Migrate your delegated MKR
                </Heading>
                <Text as="p" variant="secondary">
                  One or more of your MakerDAO delegate&lsquo;s contracts have been replaced by v2 delegate
                  contracts.{' '}
                </Text>
              </Box>

              <Card sx={{ display: 'flex', alignItems: 'flex-start', mb: 3 }}>
                <Box sx={{ mr: 2, mt: 1 }}>
                  <Icon name="info" />
                </Box>
                <Box>
                  <Text as="p" sx={{ fontWeight: '600' }}>
                    V2 Maker delegate contracts do not expire.
                  </Text>
                  <Text as="p" variant="secondary" sx={{ mt: 2 }}>
                    This means the annual migration will no longer be necessary after fully migrating to V2.
                  </Text>
                </Box>
              </Card>

              <Box>
                <Box>
                  <Text as="h2" variant="heading">
                    MKR delegated to v1 delegate contracts
                  </Text>
                  <Text as="p" variant="secondary" sx={{ mt: 2 }}>
                    Please undelegate your MKR from the old contracts below, one by one.
                  </Text>
                  <Text as="p" variant="secondary">
                    An approval transaction will be required if this is your first time undelegating from this
                    contract.
                  </Text>
                </Box>

                {delegatesThatAreV1WithMKRDelegated.length > 0 && (
                  <Box>
                    {delegatesThatAreV1WithMKRDelegated.map(delegate => {
                      return (
                        <Box key={`delegated-about-to-expiry-${delegate.address}`} sx={{ mb: 3 }}>
                          <DelegateExpirationOverviewCard delegate={delegate} />
                        </Box>
                      );
                    })}
                  </Box>
                )}
                {delegatesThatAreV1WithMKRDelegated.length === 0 && (
                  <Box
                    sx={{
                      textAlign: 'center',
                      padding: '50px',
                      marginTop: 3,
                      marginBottom: 2,
                      border: '1px dashed #E3E9F0',
                      borderRadius: 1
                    }}
                  >
                    <Box
                      sx={{
                        borderRadius: '100%',
                        border: '1px dashed #E3E9F0',
                        display: 'flex',
                        margin: '0 auto',
                        width: '54px',
                        height: '54px',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}
                    >
                      <Icon name="calendarcross" size={3} color="text" />
                    </Box>
                    <Text as="p" variant="secondary">
                      None of your delegates contracts have been replaced by v2 delegate contracts.
                    </Text>
                    <Text>No further action needed!</Text>
                  </Box>
                )}
              </Box>

              <Box>
                <Box>
                  <Text as="h2" variant="heading">
                    V2 delegate contracts of your previous delegates
                  </Text>
                  <Text as="p" variant="secondary" sx={{ mt: 2 }}>
                    Please delegate your MKR to the v2 delegate contracts below, one by one.
                  </Text>
                  <Text as="p" variant="secondary">
                    An approval transaction will be required if this is your first time delegating to this
                    contract.
                  </Text>
                </Box>

                <Box>
                  {delegatesThatAreNotV1.length > 0 &&
                    delegatesThatAreNotV1.map(delegate => {
                      return (
                        <Box key={`delegated-about-to-expiry-${delegate.address}`} sx={{ mb: 3 }}>
                          <DelegateExpirationOverviewCard delegate={delegate} />
                        </Box>
                      );
                    })}
                  {delegatesThatAreNotV1.length === 0 && (
                    <Box
                      sx={{
                        textAlign: 'center',
                        padding: '50px',
                        marginTop: 3,
                        marginBottom: 2,
                        border: '1px dashed #E3E9F0',
                        borderRadius: 1
                      }}
                    >
                      <Text as="p" variant="secondary">
                        None of your delegates have renewed their contract yet.
                      </Text>
                      <Text as="p">
                        Check back here later, or visit the delegates page and pick a delegate manually.
                      </Text>
                      <Link href="/delegates">
                        <Button sx={{ mt: 3 }}>Go to delegates page</Button>
                      </Link>
                    </Box>
                  )}
                </Box>
              </Box>
            </Stack>
          )}
          {!isLoading && isEmpty && (
            <Box>
              <Card
                sx={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  textAlign: 'center',
                  maxWidth: '700px',
                  margin: '0 auto',
                  p: 4
                }}
              >
                <Icon name="info" size={5} color="primary" />{' '}
                <Text as="h3" mb={2}>
                  No action required
                </Text>
                <Text as="p" mb={2} variant="secondary">
                  You don&apos;t have any MKR delegated to replaced v1 delegate contracts
                </Text>
                <Link href="/delegates">
                  <Button sx={{ mt: 2, mb: 2 }}>Go to delegates page</Button>
                </Link>
              </Card>
            </Box>
          )}
        </Box>
      )}
    </PrimaryLayout>
  );
}
