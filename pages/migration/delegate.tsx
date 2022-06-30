import { useState } from 'react';
import { Box, Card, Heading, Text } from 'theme-ui';
import PrimaryLayout from 'modules/app/components/layout/layouts/Primary';
import Stack from 'modules/app/components/layout/layouts/Stack';
import { HeadComponent } from 'modules/app/components/layout/Head';
import { useActiveWeb3React } from 'modules/web3/hooks/useActiveWeb3React';
import AccountNotConnected from 'modules/web3/components/AccountNotConnected';
import { useDelegationMigrationStatus } from 'modules/migration/hooks/useDelegationMigrationStatus';

import { STEPS } from 'modules/migration/steps';
import { MigrationSteps } from 'modules/migration/components/MigrationSteps';

export default function DelegateMigrationPage(): React.ReactElement {
  const { account } = useActiveWeb3React();
  const [migrationInfoAcknowledged, setMigrationInfoAcknowledged] = useState(false);

  const {
    isDelegateContractExpiring,
    isDelegateContractExpired,
    accountIsPreviousOwner,
    accountIsNewOwner,
    newOwnerHasDelegateContract
  } = useDelegationMigrationStatus();

  const connectedAddressFound = accountIsPreviousOwner || accountIsNewOwner;

  // the user should be shown the steps to take action if:
  // a - the connected account has an expired/expiring contract
  //      or
  // b - the connected count is the new account of a previous delegate
  //     and has not created the delegate contract yet
  const actionNeeded =
    // a
    isDelegateContractExpiring ||
    isDelegateContractExpired ||
    // b
    (accountIsNewOwner && !newOwnerHasDelegateContract);

  const getCurrentStep = (): string => {
    if (!isDelegateContractExpired && !isDelegateContractExpiring) {
      return STEPS.MIGRATION_INFO;
    }
    if (
      (isDelegateContractExpiring || isDelegateContractExpired) &&
      !connectedAddressFound &&
      migrationInfoAcknowledged
    ) {
      return STEPS.NEW_ADDRESS;
    }
    if (
      (isDelegateContractExpiring || isDelegateContractExpired) &&
      connectedAddressFound &&
      accountIsPreviousOwner
    ) {
      return STEPS.CONNECT_WALLET;
    }
    if (connectedAddressFound && accountIsNewOwner && !newOwnerHasDelegateContract) {
      return STEPS.NEW_DELEGATE_CONTRACT;
    }

    return STEPS.MIGRATION_INFO;
  };

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

          {actionNeeded && (
            <Card sx={{ p: 3 }}>
              <MigrationSteps activeStep={getCurrentStep()} />
            </Card>
          )}
        </Stack>
      )}
    </PrimaryLayout>
  );
}
