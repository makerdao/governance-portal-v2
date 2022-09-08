import { ClientRenderOnly } from 'modules/app/components/ClientRenderOnly';
import AccountSelect from 'modules/app/components/layout/header/AccountSelect';
import { Box, Flex, Text } from 'theme-ui';

export default function AccountNotConnected({
  message = 'Connect your wallet to continue'
}: {
  message?: string;
}): React.ReactElement {
  return (
    <Box
      sx={{
        maxWidth: '400px',
        margin: '0 auto',
        p: 4
      }}
    >
      <Text as="h4" sx={{ textAlign: 'center', mb: 3 }}>
        {message}
      </Text>

      <Flex sx={{ justifyContent: 'center', justifyItems: 'center' }}>
        <ClientRenderOnly>
          <AccountSelect />
        </ClientRenderOnly>
      </Flex>
    </Box>
  );
}
