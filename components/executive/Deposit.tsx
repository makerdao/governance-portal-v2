/** @jsx jsx */
import { useState } from 'react';
import { Button, jsx } from 'theme-ui';
import { DialogOverlay, DialogContent } from '@reach/dialog';
// import Bignumber from 'bignumber.js';

// import getMaker, { getNetwork } from '../../lib/maker';
// import useTransactionStore, { transactionsApi, transactionsSelectors } from '../../stores/transactions';
// import { getEtherscanLink } from '../../lib/utils';
// import shallow from 'zustand/shallow';
// import useAccountsStore from '../../stores/accounts';

const Deposit = props => {
  const [showDialog, setShowDialog] = useState(false);

  return (
    <>
      <DialogOverlay
        style={{ background: 'hsla(237.4%, 13.8%, 32.7%, 0.9)' }}
        isOpen={showDialog}
        onDismiss={close}
      >
        <DialogContent
          aria-label="Executive Vote"
          sx={{ borderRadius: '8px', boxShadow: '0px 10px 50px hsla(0, 0%, 0%, 0.33)', width: '50em', p: 4 }}
        >
          <div>dialog content!!</div>
        </DialogContent>
      </DialogOverlay>
      <Button variant="mutedOutline" onClick={() => setShowDialog(true)} {...props}>
        Deposit
      </Button>
    </>
  );
};

export default Deposit;
