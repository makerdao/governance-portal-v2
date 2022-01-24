import { Card, Box, Button, Heading } from 'theme-ui';
import React, { useState } from 'react';
import { Delegate } from '../types';
import { ANALYTICS_PAGES } from 'modules/app/client/analytics/analytics.constants';
import { useAnalytics } from 'modules/app/client/analytics/useAnalytics';
import { DelegateModal } from './modals/DelegateModal';
import { UndelegateModal } from './modals/UndelegateModal';
import { useLockedMkr } from 'modules/mkr/hooks/useLockedMkr';
import { useMkrDelegated } from 'modules/mkr/hooks/useMkrDelegated';
import { useAccount } from 'modules/app/hooks/useAccount';

export default function ManageDelegation({ delegate }: { delegate: Delegate }): React.ReactElement {
  const { account } = useAccount();
  const { trackButtonClick } = useAnalytics(ANALYTICS_PAGES.DELEGATE_DETAIL);
  const [showDelegateModal, setShowDelegateModal] = useState(false);
  const [showUndelegateModal, setShowUndelegateModal] = useState(false);

  const { mutate: mutateTotalStaked } = useLockedMkr(delegate.voteDelegateAddress);
  const { mutate: mutateMkrStaked } = useMkrDelegated(account, delegate.voteDelegateAddress);

  return (
    <Box>
      <Heading mt={3} mb={2} as="h3" variant="microHeading">
        Manage Delegation
      </Heading>
      <Card variant="compact">
        <Box>
          <Button
            variant="primaryLarge"
            disabled={!account}
            onClick={() => {
              trackButtonClick('openDelegateModal');
              setShowDelegateModal(true);
            }}
            sx={{ width: '100%', height: 'auto', mb: [3] }}
          >
            Delegate your MKR to this Delegate
          </Button>
        </Box>

        <Box>
          <Button
            variant="primaryOutline"
            disabled={!account}
            onClick={() => {
              trackButtonClick('openUndelegateModal');
              setShowUndelegateModal(true);
            }}
            sx={{ width: '100%', height: 'auto' }}
          >
            Undelegate your MKR from this Delegate
          </Button>
        </Box>
      </Card>
      <DelegateModal
        delegate={delegate}
        isOpen={showDelegateModal}
        onDismiss={() => setShowDelegateModal(false)}
        mutateTotalStaked={mutateTotalStaked}
        mutateMkrStaked={mutateMkrStaked}
      />
      <UndelegateModal
        delegate={delegate}
        isOpen={showUndelegateModal}
        onDismiss={() => setShowUndelegateModal(false)}
        mutateTotalStaked={mutateTotalStaked}
        mutateMkrStaked={mutateMkrStaked}
      />
    </Box>
  );
}
