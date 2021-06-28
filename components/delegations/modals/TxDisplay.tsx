import TxFinal from './TxFinal';
import TransactionInProgress from './TransactionInProgress';

const TxDisplay = ({ tx, setTxId, onDismiss }) => {
  switch (tx?.status) {
    case 'mined':
      return (
        <TxFinal
          title="Transaction Sent"
          description="Delegate contract will update once the blockchain has confirmed the transaction."
          buttonLabel="Close"
          onClick={onDismiss}
          tx={tx}
          success={true}
        />
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
      return <TransactionInProgress txPending={tx?.status === 'pending'} setTxId={setTxId} />;
  }
};

export default TxDisplay;
