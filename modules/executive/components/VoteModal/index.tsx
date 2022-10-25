import { useState } from 'react';
import { Button, Flex, Close, Text } from 'theme-ui';
import shallow from 'zustand/shallow';
import { Icon } from '@makerdao/dai-ui-icons';
import { transactionsSelectors } from 'modules/web3/stores/transactions';
import { Proposal } from 'modules/executive/types';
import { TxInProgress } from 'modules/app/components/TxInProgress';
import { TxFinal } from 'modules/app/components/TxFinal';
import DefaultVoteModalView from './DefaultView';
import useTransactionsStore from 'modules/web3/stores/transactions';
import { DialogContent, DialogOverlay } from 'modules/app/components/Dialog';

type Props = {
  close: () => void;
  proposal?: Proposal;
  address?: string;
};

type ModalStep = 'confirm' | 'signing' | 'pending' | 'mined' | 'failed';

const VoteModal = ({ close, proposal, address }: Props): JSX.Element => {
  const [step, setStep] = useState<ModalStep>('confirm');

  const [txId, setTxId] = useState('');

  const tx = useTransactionsStore(
    state => (txId ? transactionsSelectors.getTransaction(state, txId) : null),
    shallow
  );

  return (
    <DialogOverlay isOpen={true} onDismiss={close}>
      <DialogContent aria-label="Executive Vote">
        {step === 'confirm' && (
          <DefaultVoteModalView
            proposal={proposal}
            address={address}
            close={close}
            onTransactionPending={() => setStep('pending')}
            onTransactionFailed={() => setStep('failed')}
            onTransactionCreated={transactionId => setTxId(transactionId)}
            onTransactionMined={() => setStep('mined')}
          />
        )}

        {step === 'pending' && tx && <TxInProgress tx={tx} txPending={true} setTxId={close} />}

        {step === 'mined' && tx && (
          <TxFinal
            title="Transaction Sent"
            description={
              <Flex sx={{ alignItems: 'center', mt: 1 }}>
                <Icon name="info" color="textSecondary" />
                <Text as="p" variant="secondary" sx={{ ml: 1 }}>
                  Your vote and comment may take a few minutes to appear in the Voting Portal
                </Text>
              </Flex>
            }
            buttonLabel="Close"
            onClick={close}
            tx={tx}
            success={true}
          />
        )}
        {step === 'failed' && <Error close={close} />}
      </DialogContent>
    </DialogOverlay>
  );
};

const Error = ({ close }) => (
  <Flex sx={{ flexDirection: 'column', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
    <Close
      aria-label="close"
      sx={{ height: '20px', width: '20px', p: 0, alignSelf: 'flex-end' }}
      onClick={close}
    />
    <Text as="p" variant="heading" sx={{ fontSize: 6 }}>
      Transaction Failed.
    </Text>
    <Flex sx={{ flexDirection: 'column', alignItems: 'center' }}>
      <Icon name="reviewFailed" size={5} sx={{ my: 3 }} />
      <Text as="p" sx={{ color: 'onSecondary', fontWeight: 'medium', fontSize: '16px' }}>
        Something went wrong with your transaction. Please try again.
      </Text>
      <Button
        onClick={close}
        sx={{ mt: 5, borderColor: 'primary', width: '100%', color: 'primary' }}
        variant="outline"
      >
        Close
      </Button>
    </Flex>
  </Flex>
);

export default VoteModal;
