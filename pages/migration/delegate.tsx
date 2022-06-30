import { Box, Heading, Text } from 'theme-ui';
import PrimaryLayout from 'modules/app/components/layout/layouts/Primary';
import Stack from 'modules/app/components/layout/layouts/Stack';
import { HeadComponent } from 'modules/app/components/layout/Head';
import { useActiveWeb3React } from 'modules/web3/hooks/useActiveWeb3React';
import AccountNotConnected from 'modules/web3/components/AccountNotConnected';
import { useDelegationMigrationStatus } from 'modules/migration/hooks/useDelegationMigrationStatus';
import { addressConnections } from 'modules/migration/connections';

export default function DelegateMigrationPage(): React.ReactElement {
  const { account } = useActiveWeb3React();

  // TODO: probably move this somewhere else
  const oldToNewMap = addressConnections;
  const newToOldMap = Object.keys(addressConnections).reduce((acc, cur) => {
    return {
      ...acc,
      [addressConnections[cur]]: cur
    };
  }, {});

  const { isDelegateContractExpiring, isDelegateContractExpired } = useDelegationMigrationStatus();
  const accountIsPreviousOwner = !!oldToNewMap[account];
  const accountIsNewOwner = !!newToOldMap[account];
  const connectedAddressFound = accountIsPreviousOwner || accountIsNewOwner;

  const STEPS = {
    NO_ACTION: 'NO_ACTION',
    READY_TO_MIGRATE: 'READY_TO_MIGRATE',
    CONNECT_NEW_WALLET: 'CONNECT_NEW_WALLET',
    CREATE_NEW_CONTRACT: 'CREATE_NEW_CONTRACT'
  };

  const getCurrentStep = () => {
    if (!isDelegateContractExpired && !isDelegateContractExpiring) {
      return STEPS.NO_ACTION;
    }
    if ((isDelegateContractExpiring || isDelegateContractExpired) && !connectedAddressFound) {
      return STEPS.READY_TO_MIGRATE;
    }
    if (
      (isDelegateContractExpiring || isDelegateContractExpired) &&
      connectedAddressFound &&
      accountIsPreviousOwner
    ) {
      return STEPS.CONNECT_NEW_WALLET;
    }
    if (connectedAddressFound && accountIsNewOwner) {
      return STEPS.CREATE_NEW_CONTRACT;
    }
  };

  console.log(getCurrentStep());

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
            {isDelegateContractExpired &&
              'Your delegate contract has expired! Please migrate as soon as possible.'}
            {isDelegateContractExpiring &&
              !isDelegateContractExpired &&
              'Your delegate contract is about to expire. Please migrate as soon as possible.'}
            {!isDelegateContractExpired &&
              !isDelegateContractExpiring &&
              "You don't need to migrate your delegate contract yet."}
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
