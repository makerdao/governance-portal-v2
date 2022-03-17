import { TxInProgress } from 'modules/app/components/TxInProgress';
import { TxFinal } from 'modules/app/components/TxFinal';
import { Transaction } from 'modules/web3/types/transaction';
export const TxDisplay = ({
  tx,
  setTxId,
  onDismiss,
  children,
  title = 'Transaction Sent',
  description = 'Delegate contract will update once the transaction has been confirmed.'
}: {
  tx: Transaction | null;
  children?: React.ReactNode;
  setTxId: (txId: null) => void;
  onDismiss: () => void;
  title?: string;
  description?: string;
}): React.ReactElement => {
  switch (tx?.status) {
    case 'mined':
      return (
        <TxFinal
          title={title}
          description={description}
          buttonLabel="Close"
          onClick={onDismiss}
          tx={tx}
          success={true}
        >
          {children}
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
