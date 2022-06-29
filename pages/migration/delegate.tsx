import { Box, Heading, Text } from 'theme-ui';
import PrimaryLayout from 'modules/app/components/layout/layouts/Primary';
import Stack from 'modules/app/components/layout/layouts/Stack';
import { HeadComponent } from 'modules/app/components/layout/Head';
import { useActiveWeb3React } from 'modules/web3/hooks/useActiveWeb3React';
import AccountNotConnected from 'modules/web3/components/AccountNotConnected';

export default function DelegateMigrationPage(): React.ReactElement {
  const hasExpired = true;
  const isAboutToExpire = false;
  const { account } = useActiveWeb3React();

  return (
    <PrimaryLayout sx={{ maxWidth: 'dashboard' }}>
      <HeadComponent title="Migrate your delegate contract" />
      {!account && (
        <Box>
          <AccountNotConnected />
        </Box>
      )}
      {account && (
        <Stack gap={3}>
          <Heading mb={2} as="h4" sx={{ textAlign: 'center' }}>
            {hasExpired && 'Your delegate contract has expired! Please migrate as soon as possible.'}
            {isAboutToExpire &&
              !hasExpired &&
              'Your delegate contract is about to expire. Please migrate as soon as possible.'}
            {!hasExpired && !isAboutToExpire && "You don't need to migrate your delegate contract yet."}
          </Heading>

          <Text
            as="h3"
            sx={{ textAlign: 'center', fontWeight: 'semiBold', maxWidth: '550px', margin: '0 auto' }}
          >
            Finish migration in order to remain active as a delegate and preserve your voting history &amp;
            metrics.
          </Text>
        </Stack>
      )}
    </PrimaryLayout>
  );
}