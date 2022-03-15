import { useState } from 'react';
import { Button, Flex, Close, Text } from 'theme-ui';
import { useBreakpointIndex } from '@theme-ui/match-media';
import { DialogOverlay, DialogContent } from '@reach/dialog';
import shallow from 'zustand/shallow';
import { Icon } from '@makerdao/dai-ui-icons';

import { fadeIn, slideUp } from 'lib/keyframes';

import { transactionsSelectors } from 'modules/web3/stores/transactions';
import { Proposal } from 'modules/executive/types';
import { TxInProgress } from 'modules/app/components/TxInProgress';
import { TxFinal } from 'modules/app/components/TxFinal';
import DefaultVoteModalView from './DefaultView';
import useTransactionsStore from 'modules/web3/stores/transactions';

type Props = {
  close: () => void;
  proposal: Proposal;
};

type ModalStep = 'confirm' | 'signing' | 'pending' | 'mined' | 'failed';

const VoteModal = ({ close, proposal }: Props): JSX.Element => {
  const bpi = useBreakpointIndex();

  const [step, setStep] = useState<ModalStep>('confirm');

  const [txId, setTxId] = useState('');

  const tx = useTransactionsStore(
    state => (txId ? transactionsSelectors.getTransaction(state, txId) : null),
    shallow
  );

  return (
    <DialogOverlay style={{ background: 'hsla(237.4%, 13.8%, 32.7%, 0.9)' }} onDismiss={close}>
      <DialogContent
        aria-label="Executive Vote"
        sx={
          bpi === 0
            ? { variant: 'dialog.mobile', animation: `${slideUp} 350ms ease` }
            : { variant: 'dialog.desktop', animation: `${fadeIn} 350ms ease`, p: 4 }
        }
      >
        {step === 'confirm' && (
          <DefaultVoteModalView
            proposal={proposal}
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
            description="Your vote will be reflected once the transaction has been confirmed."
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
