import { useState, useEffect } from 'react';
import { Box } from 'theme-ui';
import { useBreakpointIndex } from '@theme-ui/match-media';
import { DialogOverlay, DialogContent } from '@reach/dialog';
import shallow from 'zustand/shallow';
import BigNumber from 'bignumber.js';
import { MKR } from 'lib/maker';
import { fadeIn, slideUp } from 'lib/keyframes';
import { useMkrBalance } from 'modules/mkr/hooks/useMkrBalance';
import useAccountsStore from 'modules/app/stores/accounts';
import useTransactionStore, {
  transactionsSelectors,
  transactionsApi
} from 'modules/web3/stores/transactions';
import { Delegate } from '../../types';
import { BoxWithClose } from 'modules/app/components/BoxWithClose';
import { InputDelegateMkr } from './InputDelegateMkr';
import { ApprovalContent } from './Approval';
import { TxDisplay } from './TxDisplay';
import { ConfirmContent } from './Confirm';
import { useAnalytics } from 'modules/app/client/analytics/useAnalytics';
import { ANALYTICS_PAGES } from 'modules/app/client/analytics/analytics.constants';
import { useTokenAllowance } from 'modules/web3/hooks/useTokenAllowance';
import { useDelegateLock } from 'modules/delegates/hooks/useDelegateLock';
import { parseUnits } from '@ethersproject/units';
import { useApproveUnlimitedToken } from 'modules/web3/hooks/useApproveUnlimitedToken';

type Props = {
  isOpen: boolean;
  onDismiss: () => void;
  delegate: Delegate;
  mutateTotalStaked: () => void;
  mutateMkrStaked: () => void;
};

export const DelegateModal = ({
  isOpen,
  onDismiss,
  delegate,
  mutateTotalStaked,
  mutateMkrStaked
}: Props): JSX.Element => {
  const bpi = useBreakpointIndex();
  const { trackButtonClick } = useAnalytics(ANALYTICS_PAGES.DELEGATES);
  const account = useAccountsStore(state => state.currentAccount);
  const address = account?.address;
  const voteDelegateAddress = delegate.voteDelegateAddress;
  const [mkrToDeposit, setMkrToDeposit] = useState<BigNumber>(new BigNumber(0));
  const [txId, setTxId] = useState(null);
  const [confirmStep, setConfirmStep] = useState(false);

  const { data: mkrBalance, mutate: mutateMkrBalance } = useMkrBalance(address);

  const { data: mkrAllowance, mutate: mutateTokenAllowance } = useTokenAllowance(
    MKR,
    address,
    voteDelegateAddress
  );

  const { data: lock } = useDelegateLock(voteDelegateAddress);
  const approveMKR = useApproveUnlimitedToken('mkr');

  const hasLargeMkrAllowance = mkrAllowance?.gt('10e26'); // greater than 100,000,000 MKR

  const [trackTransaction, tx] = useTransactionStore(
    state => [state.track, txId ? transactionsSelectors.getTransaction(state, txId) : null],
    shallow
  );

  const approveMkr = async () => {
    const approveTxCreator = () => approveMKR(voteDelegateAddress);
    const txId = await trackTransaction(approveTxCreator, 'Approving MKR', {
      mined: txId => {
        transactionsApi.getState().setMessage(txId, 'MKR approved');
        mutateTokenAllowance();
        setTxId(null);
      },
      error: () => {
        transactionsApi.getState().setMessage(txId, 'MKR approval failed');
        setTxId(null);
      }
    });
    setTxId(txId);
  };

  const lockMkr = async () => {
    //TODO: update the mkr input to handle ethers bignumber
    const amt = mkrToDeposit.toString();
    const lockTxCreator = () => lock(parseUnits(amt, 18));
    const txId = await trackTransaction(lockTxCreator, 'Depositing MKR', {
      mined: txId => {
        mutateTotalStaked();
        mutateMkrStaked();
        mutateMkrBalance();
        transactionsApi.getState().setMessage(txId, 'MKR deposited');
      },
      error: () => {
        transactionsApi.getState().setMessage(txId, 'MKR deposit failed');
      }
    });
    setTxId(txId);
  };

  const onClose = () => {
    trackButtonClick('closeDelegateModal');
    setTxId(null);
    onDismiss();
  };

  useEffect(() => {
    // Reset the confirmation step
    setConfirmStep(false);
  }, [isOpen]);

  return (
    <>
      <DialogOverlay
        style={{ background: 'hsla(237.4%, 13.8%, 32.7%, 0.9)' }}
        isOpen={isOpen}
        onDismiss={onClose}
      >
        <DialogContent
          aria-label="Delegate modal"
          sx={
            bpi === 0
              ? { variant: 'dialog.mobile', animation: `${slideUp} 350ms ease` }
              : {
                  variant: 'dialog.desktop',
                  animation: `${fadeIn} 350ms ease`,
                  width: '580px',
                  px: 5,
                  py: 4
                }
          }
        >
          <BoxWithClose close={onClose}>
            <Box>
              {tx ? (
                <TxDisplay tx={tx} setTxId={setTxId} onDismiss={onClose} />
              ) : (
                <>
                  {mkrAllowance && hasLargeMkrAllowance ? (
                    confirmStep ? (
                      <ConfirmContent
                        mkrToDeposit={mkrToDeposit}
                        delegate={delegate}
                        onClick={lockMkr}
                        onBack={() => setConfirmStep(false)}
                      />
                    ) : (
                      <InputDelegateMkr
                        title="Deposit into delegate contract"
                        description="Input the amount of MKR to deposit into the delegate contract."
                        onChange={setMkrToDeposit}
                        balance={mkrBalance?.toBigNumber()}
                        buttonLabel="Delegate MKR"
                        onClick={() => setConfirmStep(true)}
                        showAlert={true}
                      />
                    )
                  ) : (
                    <ApprovalContent
                      onClick={approveMkr}
                      title={'Approve Delegate Contract'}
                      buttonLabel={'Approve Delegate Contract'}
                      description={
                        'Approve the transfer of MKR tokens to the delegate contract to deposit your MKR.'
                      }
                    />
                  )}
                </>
              )}
            </Box>
          </BoxWithClose>
        </DialogContent>
      </DialogOverlay>
    </>
  );
};
