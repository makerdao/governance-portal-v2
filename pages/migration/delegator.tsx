import { Box, Heading, Text } from 'theme-ui';
import PrimaryLayout from 'modules/app/components/layout/layouts/Primary';
import Stack from 'modules/app/components/layout/layouts/Stack';
import { HeadComponent } from 'modules/app/components/layout/Head';
import useDelegatedToExpired from 'modules/delegation-renewal/hooks/useDelegatedToExpired';
import { useActiveWeb3React } from 'modules/web3/hooks/useActiveWeb3React';
import AccountNotConnected from 'modules/web3/components/AccountNotConnected';
import useDelegatedTo from 'modules/delegates/hooks/useDelegatedTo';
import { useDelegates } from 'modules/delegates/hooks/useDelegates';
import { useMemo } from 'react';
import { Delegate } from 'modules/delegates/types';

export default function DelegateMigrationPage(): React.ReactElement {
  const { isAboutToExpire, isExpired } = useDelegatedToExpired();
  const { account, network } = useActiveWeb3React();

  const { data: delegatesData } = useDelegates();

  const delegatedTo = useDelegatedTo(account, network);

  const delegatesThatAreAboutToExpiry: Delegate[] = useMemo(() => {
    if (!delegatesData || !delegatedTo.data) {
      return [];
    }

    return delegatesData.delegates.filter(delegate => {
      const delegatedToDelegate = delegatedTo.data?.delegatedTo.find(i => i.address === delegate.address);

      if (!delegatedToDelegate) {
        return false;
      }
      return true;
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
            {(isExpired || isAboutToExpire) && 'ACTION REQUIRED: Migrate your delegated MKR.'}

            {!isExpired && !isAboutToExpire && "You don't need to migrate your MKR to a new delegate."}
          </Heading>

          {(isExpired || isAboutToExpire) && (
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
            <Text as="h1">Expired/about to expire contracts you delegated MKR to</Text>
            <Text as="p" variant="body">
              Please undelegate your MKR from old contracts, one by one. Might require aproval transactions.
            </Text>
          </Box>

          <Box>
            {delegatesThatAreAboutToExpiry.map(delegate => {
              return <Box key={`delegated-about-to-expiry-${delegate.address}`}>{delegate.name}</Box>;
            })}
          </Box>
        </Stack>
      )}
    </PrimaryLayout>
  );
}
