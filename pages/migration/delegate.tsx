import { useState } from 'react';
import { Box, Card, Flex, Heading, Text } from 'theme-ui';
import PrimaryLayout from 'modules/app/components/layout/layouts/Primary';
import Stack from 'modules/app/components/layout/layouts/Stack';
import { HeadComponent } from 'modules/app/components/layout/Head';
import { useActiveWeb3React } from 'modules/web3/hooks/useActiveWeb3React';
import AccountNotConnected from 'modules/web3/components/AccountNotConnected';
import { useDelegationMigrationStatus } from 'modules/migration/hooks/useDelegationMigrationStatus';
import { STEPS } from 'modules/migration/steps';
import { MigrationSteps } from 'modules/migration/components/MigrationSteps';
import { MigrationInfo } from 'modules/migration/components/MigrationInfo';
import { NewAddress } from 'modules/migration/components/NewAddress';

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
    // delegate contract is either expired or expiring and we don't have
    // a request to migrate the address yet, show migration info
    if ((isDelegateContractExpired || isDelegateContractExpiring) && !migrationInfoAcknowledged) {
      return STEPS.MIGRATION_INFO;
    }

    // same status as above, but user has acknowledged migration info,
    // show new address step
    if (
      (isDelegateContractExpiring || isDelegateContractExpired) &&
      !connectedAddressFound &&
      migrationInfoAcknowledged
    ) {
      return STEPS.NEW_ADDRESS;
    }

    // delegate contract is either expired or expiring
    // and we have processed the request to migrate
    // but user is connected with old address
    if (
      (isDelegateContractExpiring || isDelegateContractExpired) &&
      connectedAddressFound &&
      accountIsPreviousOwner
    ) {
      return STEPS.CONNECT_WALLET;
    }

    // user has connected with the address they requested to migrate to
    if (connectedAddressFound && accountIsNewOwner && !newOwnerHasDelegateContract) {
      return STEPS.NEW_DELEGATE_CONTRACT;
    }

    // no other conditions were met, show first step by default
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
            <Flex sx={{ flexDirection: 'column', width: '880px', alignSelf: 'center' }}>
              <MigrationSteps activeStep={getCurrentStep()} />
              <Card sx={{ p: 4 }}>
                {getCurrentStep() === STEPS.MIGRATION_INFO && (
                  <MigrationInfo setMigrationInfoAcknowledged={setMigrationInfoAcknowledged} />
                )}
                {getCurrentStep() === STEPS.NEW_ADDRESS && <NewAddress />}
              </Card>
            </Flex>
          )}
        </Stack>
      )}
    </PrimaryLayout>
  );
}
