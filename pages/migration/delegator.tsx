import { Box, Heading, Text } from 'theme-ui';
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
      // TODO: Here also filter to check if those are delegates renewed and linked to the previous delegate
      return !delegate.expired && !delegate.isAboutToExpire;
    });
  }, [delegatesData, delegatedTo.data]);

  return (
    <PrimaryLayout sx={{ maxWidth: 'dashboard' }}>
      <HeadComponent title="Migrate your MKR to a new delegate contract" />

      {!account && (
        <Box>
          <AccountNotConnected />
        </Box>
      )}

      {account && (
        <Stack gap={3}>
          <Heading mb={2} as="h4" sx={{ textAlign: 'center' }}>
            {(isDelegatedToExpiredContract || isDelegatedToExpiringContract) &&
              'ACTION REQUIRED: Migrate your delegated MKR.'}

            {!isDelegatedToExpiredContract &&
              !isDelegatedToExpiringContract &&
              "You don't need to migrate your MKR to a new delegate."}
          </Heading>

          {(isDelegatedToExpiredContract || isDelegatedToExpiringContract) && (
            <Text
              as="h3"
              sx={{ textAlign: 'center', fontWeight: 'semiBold', maxWidth: '550px', margin: '0 auto' }}
            >
              One or more of your MakerDAO delegate&lsquo;s contracts are expiring.
            </Text>
          )}

          <Box>
            <Text as="p" variant="body">
              Maker delegate contracts expire after 1 year.
            </Text>
            <Text>
              Please migrate your MKR by undelegating from the expiring/expired contracts and redelegating to
              the new contracts.
            </Text>
          </Box>

          <Box>
            <Text>
              Please find below any expiring/expired delegate contracts you delegated MKR to, and requires
              migration.
            </Text>
          </Box>

          <Box>
            <Box>
              <Text as="h1">Expired/about to expire contracts you delegated MKR to</Text>
              <Text as="p" variant="body">
                Please undelegate your MKR from old contracts, one by one. Might require aproval transactions.
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
              <Box>
                <Text>There are no delegates that are about to expiry.</Text>
              </Box>
            )}
          </Box>

          <Box>
            <Box>
              <Text as="h1">Renewed contracts by your previous delegates</Text>
              <Text as="p" variant="body">
                Please delegate your MKR to the new contracts, one by one. Might require aproval transactions.
              </Text>
            </Box>

            <Box>
              {delegatesThatAreNotExpired.map(delegate => {
                return (
                  <Box key={`delegated-about-to-expiry-${delegate.address}`} sx={{ mb: 3 }}>
                    <DelegateExpirationOverviewCard delegate={delegate} />
                  </Box>
                );
              })}
            </Box>
          </Box>
        </Stack>
      )}
    </PrimaryLayout>
  );
}
