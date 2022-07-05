import { Box, Button, Card, Heading, Text } from 'theme-ui';
import PrimaryLayout from 'modules/app/components/layout/layouts/Primary';
import Stack from 'modules/app/components/layout/layouts/Stack';
import { HeadComponent } from 'modules/app/components/layout/Head';
import { useMigrationStatus } from 'modules/migration/hooks/useMigrationStatus';
import { useActiveWeb3React } from 'modules/web3/hooks/useActiveWeb3React';
import AccountNotConnected from 'modules/web3/components/AccountNotConnected';
import { useDelegates } from 'modules/delegates/hooks/useDelegates';
import { useMemo } from 'react';
import { Delegate } from 'modules/delegates/types';
import { useDelegatedTo } from 'modules/delegates/hooks/useDelegatedTo';
import { DelegateExpirationOverviewCard } from 'modules/migration/components/DelegateExpirationOverviewCard';
import LocalIcon from 'modules/app/components/Icon';
import { Icon } from '@makerdao/dai-ui-icons';

import Link from 'next/link';

export default function DelegateMigrationPage(): React.ReactElement {
  const { isDelegatedToExpiringContract, isDelegatedToExpiredContract } = useMigrationStatus();
  const { account, network } = useActiveWeb3React();

  const { data: delegatesData } = useDelegates();

  const delegatedTo = useDelegatedTo(account, network);

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

  return (
    <PrimaryLayout sx={{ maxWidth: 'dashboard' }}>
      <HeadComponent title="Migrate your MKR to a new delegate contract" />

      {!account && (
        <Box>
          <AccountNotConnected />
        </Box>
      )}

      {account && (
        <Stack gap={4} sx={{ maxWidth: '950px', margin: '0 auto' }}>
          <Box>
            <Heading mb={2} as="h4" sx={{ textAlign: 'left' }}>
              Action required: Migrate your delegated MKR.
            </Heading>
            <Text as="p" sx={{ color: 'onSecondary' }}>
              One or more of your MakerDAO delegate&lsquo;s contracts are expiring.
            </Text>
          </Box>

          <Card sx={{ display: 'flex', alignItems: 'flex-start' }}>
            <Box sx={{ mr: 2, mt: 1 }}>
              <Icon name="info" />
            </Box>
            <Box>
              <Text as="p" sx={{ fontWeight: 'semiBold' }}>
                Maker delegate contracts expire after 1 year.
              </Text>
              <Text as="p" sx={{ color: 'onSecondary' }}>
                Please migrate your MKR by undelegating from the expiring/expired contracts and redelegating
                to the new contracts.
              </Text>
              <Text as="p" sx={{ color: 'onSecondary' }}>
                Find in this page any expiring/expired delegate contracts you delegated MKR to, and requires
                migration.
              </Text>
            </Box>
          </Card>

          <Box>
            <Box>
              <Text as="h2">Expired/about to expire contracts you delegated MKR to</Text>
              <Text as="p" variant="body" sx={{ color: 'onSecondary' }}>
                Please undelegate your MKR from old contracts, one by one.
              </Text>
            </Box>

            {delegatesThatAreAboutToExpiry.length > 0 && (
              <Box>
                {delegatesThatAreAboutToExpiry.map(delegate => {
                  return (
                    <Box key={`delegated-about-to-expiry-${delegate.address}`} sx={{ mb: 3 }}>
                      <DelegateExpirationOverviewCard delegate={delegate} />
                    </Box>
                  );
                })}
              </Box>
            )}
            {delegatesThatAreAboutToExpiry.length === 0 && (
              <Box
                sx={{
                  background: '#FBFBFB',
                  textAlign: 'center',
                  padding: '50px',
                  marginTop: 2,
                  marginBottom: 2,
                  border: '1px dashed #E3E9F0',
                  borderRadius: 1
                }}
              >
                <Box
                  sx={{
                    borderRadius: '100%',
                    background: 'background',
                    border: '1px dashed #E3E9F0',
                    display: 'flex',
                    margin: '0 auto',
                    width: '54px',
                    height: '54px',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                >
                  <LocalIcon name="calendarcross" />
                </Box>
                <Text as="p" sx={{ color: 'onSecondary' }}>
                  None of your delegates contracts are expired or about to expire.
                </Text>
                <Text>No further action needed!</Text>
              </Box>
            )}
          </Box>

          <Box>
            <Box>
              <Text as="h2">Renewed contracts by your previous delegates</Text>
              <Text as="p" variant="body" sx={{ color: 'onSecondary' }}>
                Please delegate your MKR to the new contracts, one by one.
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
                    background: '#FBFBFB',
                    textAlign: 'center',
                    padding: '50px',
                    marginTop: 2,
                    marginBottom: 2,
                    border: '1px dashed #E3E9F0',
                    borderRadius: 1
                  }}
                >
                  <Text as="p" sx={{ color: 'onSecondary' }}>
                    None of your delegates have renewed their contract yet.
                  </Text>
                  <Text as="p">
                    Check back here later, or visit the delegates page and pick a delegate manually.
                  </Text>
                  <Link href="/delegates">
                    <Button sx={{ mt: 2 }}>Go to delegates page</Button>
                  </Link>
                </Box>
              )}
            </Box>
          </Box>
        </Stack>
      )}
    </PrimaryLayout>
  );
}
