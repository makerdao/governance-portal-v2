import { Box, Heading, Text } from 'theme-ui';
import PrimaryLayout from 'modules/app/components/layout/layouts/Primary';
import Stack from 'modules/app/components/layout/layouts/Stack';
import { HeadComponent } from 'modules/app/components/layout/Head';
import useDelegatedToExpired from 'modules/delegation-renewal/hooks/useDelegatedToExpired';
import { useActiveWeb3React } from 'modules/web3/hooks/useActiveWeb3React';
import AccountNotConnected from 'modules/web3/components/AccountNotConnected';

export default function DelegateMigrationPage(): React.ReactElement {
  const { isAboutToExpire, isExpired } = useDelegatedToExpired();
  const { account } = useActiveWeb3React();

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
        </Stack>
      )}
    </PrimaryLayout>
  );
}