/*

SPDX-FileCopyrightText: © 2023 Dai Foundation <www.daifoundation.org>

SPDX-License-Identifier: AGPL-3.0-or-later

*/

import { useState, useMemo } from 'react';
import { Box, Card, Flex, Heading, Text } from 'theme-ui';
import PrimaryLayout from 'modules/app/components/layout/layouts/Primary';
import Stack from 'modules/app/components/layout/layouts/Stack';
import { HeadComponent } from 'modules/app/components/layout/Head';
import { useWeb3 } from 'modules/web3/hooks/useWeb3';
import AccountNotConnected from 'modules/web3/components/AccountNotConnected';
import { useMigrationStatus } from 'modules/migration/hooks/useMigrationStatus';
import { STEPS } from 'modules/migration/steps';
import { MigrationSteps } from 'modules/migration/components/MigrationSteps';
import { MigrationInfo } from 'modules/migration/components/MigrationInfo';
import { NewAddress } from 'modules/migration/components/NewAddress';
import { ConnectWallet } from 'modules/migration/components/ConnectWallet';
import { NewDelegateContract } from 'modules/migration/components/NewDelegateContract';
import { sign } from 'modules/web3/helpers/sign';
import { useLinkedDelegateInfo } from 'modules/migration/hooks/useLinkedDelegateInfo';

export default function DelegateMigrationPage(): React.ReactElement {
  const { account, provider } = useWeb3();
  const [migrationInfoAcknowledged, setMigrationInfoAcknowledged] = useState(false);

  const { isDelegateV1Contract } =
    useMigrationStatus();

  const {
    latestOwnerAddress,
    latestOwnerConnected,
    originalOwnerAddress,
    originalOwnerConnected,
    latestOwnerHasDelegateContract
  } = useLinkedDelegateInfo();

  const connectedAddressFound = !!originalOwnerAddress || !!latestOwnerAddress;

  // the user should be shown the steps to take action if:
  // a - the connected account needs to migrate to v2
  //      or
  // b - the connected count is the new account of a previous delegate
  //     and has not created the delegate contract yet
  const actionNeeded =
    // a
    isDelegateV1Contract ||
    // b
    (!!latestOwnerAddress && !latestOwnerHasDelegateContract);

  const getCurrentStep = useMemo((): string => {
    // delegate contract is v1 and we don't have
    // a request to migrate the address yet, show migration info
    if (
      (isDelegateV1Contract) &&
      !connectedAddressFound &&
      !migrationInfoAcknowledged
    ) {
      return STEPS.MIGRATION_INFO;
    }

    // same status as above, but user has acknowledged migration info,
    // show new address step
    if (
      (isDelegateV1Contract) &&
      !connectedAddressFound &&
      migrationInfoAcknowledged
    ) {
      return STEPS.NEW_ADDRESS;
    }

    // delegate contract is either expired or expiring or needs to migrate to v2
    // and we have processed the request to migrate
    // but user is connected with old address
    if (
      (isDelegateV1Contract) &&
      connectedAddressFound &&
      originalOwnerConnected
    ) {
      return STEPS.CONNECT_WALLET;
    }

    // user has connected with the address they requested to migrate to
    if (connectedAddressFound && latestOwnerConnected && !latestOwnerHasDelegateContract) {
      return STEPS.NEW_DELEGATE_CONTRACT;
    }

    // no other conditions were met, show first step by default
    return STEPS.MIGRATION_INFO;
  }, [
    isDelegateV1Contract,
    originalOwnerAddress,
    latestOwnerAddress,
    latestOwnerHasDelegateContract,
    migrationInfoAcknowledged,
    originalOwnerConnected,
    latestOwnerConnected
  ]);

  const handleSubmitNewAddress = async (newAddress: string) => {
    if (!provider) return Promise.reject();

    const msg = `This is a request to link ${account} to ${newAddress} for the purposes of delegation history.`;

    const sig = await sign(account as string, msg, provider);

    const payload = { address: account, msg, sig };

    const req = await fetch('/api/migration/link', {
      method: 'POST',
      body: JSON.stringify(payload)
    });
    return req;
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
            {isDelegateV1Contract && 'Your delegate contract needs to be migrated to v2.'}
          </Heading>
          {
            isDelegateV1Contract
            && (
              <Text
                as="h3"
                sx={{ textAlign: 'center', fontWeight: 'semiBold', maxWidth: '550px', margin: '0 auto' }}
              >
                Complete the migration to remain active as a delegate and preserve your voting history
                &amp; metrics.
              </Text>
            )}

          {actionNeeded && (
            <Flex sx={{ flexDirection: 'column', width: '880px', alignSelf: 'center' }}>
              <MigrationSteps activeStep={getCurrentStep} />
              <Card sx={{ p: 4 }}>
                {getCurrentStep === STEPS.MIGRATION_INFO && (
                  <MigrationInfo setMigrationInfoAcknowledged={setMigrationInfoAcknowledged} />
                )}
                {getCurrentStep === STEPS.NEW_ADDRESS && (
                  <NewAddress handleSubmitNewAddress={handleSubmitNewAddress} />
                )}
                {getCurrentStep === STEPS.CONNECT_WALLET && <ConnectWallet />}
                {getCurrentStep === STEPS.NEW_DELEGATE_CONTRACT && <NewDelegateContract />}
              </Card>
            </Flex>
          )}
        </Stack>
      )}
    </PrimaryLayout>
  );
}
