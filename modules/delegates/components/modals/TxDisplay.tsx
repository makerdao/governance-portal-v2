import { TxInProgress } from 'modules/app/components/TxInProgress';
import { TxFinal } from 'modules/app/components/TxFinal';
import { Transaction } from 'modules/web3/types/transaction';
import { Delegate } from 'modules/delegates/types';
import DelegateAvatarName from '../DelegateAvatarName';
import { BigNumber } from 'ethers';
import { formatValue } from 'lib/string';
import { Box } from 'theme-ui';

export const TxDisplay = ({
  tx,
  setTxId,
  onDismiss,
  delegate,
  mkrAmount
}: {
  tx: Transaction;
  delegate: Delegate;
  setTxId: (txId: null) => void;
  onDismiss: () => void;
  mkrAmount: BigNumber;
}): React.ReactElement => {
  switch (tx?.status) {
    case 'mined':
      return (
        <TxFinal
          title={`Delegating to ${delegate.name}`}
          description={`Congratulations, you delegated ${formatValue(mkrAmount)} MKR to ${delegate.name}.`}
          buttonLabel="Close"
          onClick={onDismiss}
          tx={tx}
          success={true}
        >
          <Box sx={{ textAlign: 'left', margin: '0 auto', p: 3 }}>
            <DelegateAvatarName delegate={delegate} />
          </Box>
        </TxFinal>
      );
    case 'error':
      return (
        <TxFinal
          title="Transaction Failed"
          description="An error occured. Please check the link below for more information."
          buttonLabel="Close"
          onClick={onDismiss}
          tx={tx}
          success={false}
        />
      );
    default:
      return <TxInProgress tx={tx} txPending={tx?.status === 'pending'} setTxId={setTxId} />;
  }
};
