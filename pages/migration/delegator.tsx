import { Box, Button, Card, Heading, Text } from 'theme-ui';
import PrimaryLayout from 'modules/app/components/layout/layouts/Primary';
import Stack from 'modules/app/components/layout/layouts/Stack';
import { HeadComponent } from 'modules/app/components/layout/Head';
import { useWeb3 } from 'modules/web3/hooks/useWeb3';
import AccountNotConnected from 'modules/web3/components/AccountNotConnected';
import { useDelegates } from 'modules/delegates/hooks/useDelegates';
import { useMemo } from 'react';
import { Delegate } from 'modules/delegates/types';
import { useDelegatedTo } from 'modules/delegates/hooks/useDelegatedTo';
import { DelegateExpirationOverviewCard } from 'modules/migration/components/DelegateExpirationOverviewCard';
import LocalIcon from 'modules/app/components/Icon';
import { Icon } from '@makerdao/dai-ui-icons';

import Link from 'next/link';
import PageLoadingPlaceholder from 'modules/app/components/PageLoadingPlaceholder';
import { ExternalLink } from 'modules/app/components/ExternalLink';

export default function DelegateMigrationPage(): React.ReactElement {
  const { account, network } = useWeb3();

  const { data: delegatesData } = useDelegates();

  const delegatedTo = useDelegatedTo(account, network);

  // List of delegates that are about to expiry, the user has to undelegate from them
  const delegatesThatAreAboutToExpiryWithMKRDelegated: Delegate[] = useMemo(() => {
    if (!delegatesData || !delegatedTo.data) {
      return [];
    }

    return delegatesData.delegates.filter(delegate => {
      const delegatedToDelegate = delegatedTo.data?.delegatedTo.find(
        i => i.address === delegate.voteDelegateAddress
      );

      if (!delegatedToDelegate || parseFloat(delegatedToDelegate.lockAmount) === 0) {
        return false;
      }
      return delegate.expired || delegate.isAboutToExpire;
    });
  }, [delegatesData, delegatedTo.data]);

  // Historical list of delegates that the user interacted with that are about to expiry (no need to have current MKR delegated to them)
  const delegatesThatAreAboutToExpiry: Delegate[] = useMemo(() => {
    if (!delegatesData || !delegatedTo.data) {
      return [];
    }

    return delegatesData.delegates.filter(delegate => {
      const delegatedToDelegate = delegatedTo.data?.delegatedTo.find(
        i => i.address === delegate.voteDelegateAddress
      );

      if (!delegatedToDelegate) {
        return false;
      }
      return delegate.expired || delegate.isAboutToExpire;
    });
  }, [delegatesData, delegatedTo.data]);

  // List of new delegates that can be renewed, the user has to delegate to them
  const delegatesThatAreNotExpired: Delegate[] = useMemo(() => {
    if (!delegatesData) {
      return [];
    }

    return delegatesData.delegates.filter(delegate => {
      const isPreviousDelegate = delegatesThatAreAboutToExpiry.find(
        i => i.address.toLowerCase() === delegate.previous?.address.toLowerCase()
      );
      return !delegate.expired && !delegate.isAboutToExpire && isPreviousDelegate;
    });
  }, [delegatesData, delegatesThatAreAboutToExpiry, delegatedTo.data]);

  // UI loading states
  const { isLoading, isEmpty } = useMemo(() => {
    const isLoading = !delegatesData || !delegatedTo.data;
    const isEmpty =
      delegatesThatAreAboutToExpiryWithMKRDelegated.length === 0 && delegatesThatAreNotExpired.length === 0;

    return {
      isLoading,
      isEmpty
    };
  }, [
    delegatesData,
    delegatedTo.data,
    delegatesThatAreAboutToExpiryWithMKRDelegated,
    delegatesThatAreNotExpired
  ]);

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
                  One or more of your MakerDAO delegate&lsquo;s contracts are expiring.{' '}
                  <ExternalLink
                    href="https://manual.makerdao.com/delegation/delegate-expiration"
                    title="Read more about delegate expiration"
                  >
                    <span sx={{ color: 'accentBlue' }}>Read more about delegate expiration.</span>
                  </ExternalLink>
                </Text>
              </Box>

              <Card sx={{ display: 'flex', alignItems: 'flex-start', mb: 3 }}>
                <Box sx={{ mr: 2, mt: 1 }}>
                  <Icon name="info" />
                </Box>
                <Box>
                  <Text as="p" sx={{ fontWeight: '600' }}>
                    Maker delegate contracts expire after 1 year.
                  </Text>
                  <Text as="p" variant="secondary" sx={{ mt: 2 }}>
                    Please migrate your MKR by undelegating from the expiring/expired contracts and
                    redelegating to the new contracts.
                  </Text>
                  <Text as="p" variant="secondary">
                    On this page you&apos;ll find your delegates that require migrating your delegated MKR due
                    to expiration.
                  </Text>
                </Box>
              </Card>

              <Box>
                <Box>
                  <Text as="h2" variant="heading">
                    MKR delegated to expiring/expired delegate contracts
                  </Text>
                  <Text as="p" variant="secondary" sx={{ mt: 2 }}>
                    Please undelegate your MKR from the old contracts below, one by one.
                  </Text>
                  <Text as="p" variant="secondary">
                    An approval transaction will be required if this is your first time undelegating from this
                    contract.
                  </Text>
                </Box>

                {delegatesThatAreAboutToExpiryWithMKRDelegated.length > 0 && (
                  <Box>
                    {delegatesThatAreAboutToExpiryWithMKRDelegated.map(delegate => {
                      return (
                        <Box key={`delegated-about-to-expiry-${delegate.address}`} sx={{ mb: 3 }}>
                          <DelegateExpirationOverviewCard delegate={delegate} />
                        </Box>
                      );
                    })}
                  </Box>
                )}
                {delegatesThatAreAboutToExpiryWithMKRDelegated.length === 0 && (
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
                      <LocalIcon name="calendarcross" size={3} color="text" />
                    </Box>
                    <Text as="p" variant="secondary">
                      None of your delegates contracts are expired or about to expire.
                    </Text>
                    <Text>No further action needed!</Text>
                  </Box>
                )}
              </Box>

              <Box>
                <Box>
                  <Text as="h2" variant="heading">
                    Renewed contracts of your previous delegates
                  </Text>
                  <Text as="p" variant="secondary" sx={{ mt: 2 }}>
                    Please delegate your MKR to the renewed contracts below, one by one.
                  </Text>
                  <Text as="p" variant="secondary">
                    An approval transaction will be required if this is your first time delegating to this
                    contract.
                  </Text>
                </Box>

                <Box>
                  {delegatesThatAreNotExpired.length > 0 &&
                    delegatesThatAreNotExpired.map(delegate => {
                      return (
                        <Box key={`delegated-about-to-expiry-${delegate.address}`} sx={{ mb: 3 }}>
                          <DelegateExpirationOverviewCard delegate={delegate} />
                        </Box>
                      );
                    })}
                  {delegatesThatAreNotExpired.length === 0 && (
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
                  You don&apos;t have any MKR delegated to expiring/expired delegate contracts
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
