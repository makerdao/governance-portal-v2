/*

SPDX-FileCopyrightText: © 2023 Dai Foundation <www.daifoundation.org>

SPDX-License-Identifier: AGPL-3.0-or-later

*/

import { Card, Box, Button, Heading } from 'theme-ui';
import React, { useState } from 'react';
import { Delegate } from '../types';
import { DelegateModal } from './modals/DelegateModal';
import { UndelegateModal } from './modals/UndelegateModal';
import { useLockedSky } from 'modules/sky/hooks/useLockedSky';
import { useMkrDelegatedByUser } from 'modules/sky/hooks/useMkrDelegatedByUser';
import { useAccount } from 'modules/app/hooks/useAccount';

export default function ManageDelegation({
  delegate,
  textDelegate = 'Delegate SKY to this delegate',
  textUndelegate = 'Undelegate SKY from this delegate'
}: {
  delegate: Delegate;
  textDelegate?: string;
  textUndelegate?: string;
}): React.ReactElement {
  const { account } = useAccount();
  const [showDelegateModal, setShowDelegateModal] = useState(false);
  const [showUndelegateModal, setShowUndelegateModal] = useState(false);

  const { mutate: mutateTotalStaked } = useLockedSky(delegate.voteDelegateAddress);
  const { mutate: mutateMkrStaked } = useMkrDelegatedByUser(account, delegate.voteDelegateAddress);

  return (
    <Box>
      <Heading mt={3} mb={2} as="h3" variant="microHeading">
        Manage Delegation
      </Heading>
      <Card variant="compact">
        <Box>
          <Button
            variant="primaryLarge"
            data-testid="button-delegate"
            disabled={!account}
            onClick={() => {
              setShowDelegateModal(true);
            }}
            sx={{ width: '100%', height: 'auto', mb: [3] }}
          >
            {textDelegate}
          </Button>
        </Box>

        <Box>
          <Button
            variant="primaryOutline"
            disabled={!account}
            onClick={() => {
              setShowUndelegateModal(true);
            }}
            sx={{ width: '100%', height: 'auto' }}
          >
            {textUndelegate}
          </Button>
        </Box>
      </Card>
      {showDelegateModal && (
        <DelegateModal
          delegate={delegate}
          isOpen={showDelegateModal}
          onDismiss={() => setShowDelegateModal(false)}
          mutateTotalStaked={mutateTotalStaked}
          mutateSkyDelegated={mutateMkrStaked}
        />
      )}
      {showUndelegateModal && (
        <UndelegateModal
          delegate={delegate}
          isOpen={showUndelegateModal}
          onDismiss={() => setShowUndelegateModal(false)}
          mutateTotalStaked={mutateTotalStaked}
          mutateSkyDelegated={mutateMkrStaked}
        />
      )}
    </Box>
  );
}
