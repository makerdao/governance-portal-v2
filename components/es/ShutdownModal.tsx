/** @jsx jsx */
import {
  Flex,
  Box,
  Button,
  Text,
  Grid,
  Input,
  jsx,
  Close,
  Label,
  Checkbox,
  Link,
  Divider,
  Spinner
} from 'theme-ui';
import { useState, useEffect } from 'react';
import useSWR from 'swr';
import shallow from 'zustand/shallow';
import getMaker, { MKR, getNetwork } from '../../lib/maker';
import { Icon } from '@makerdao/dai-ui-icons';
import { useBreakpointIndex } from '@theme-ui/match-media';
import Toggle from './Toggle';
import useTransactionStore, { transactionsApi, transactionsSelectors } from '../../stores/transactions';
import { getEtherscanLink } from '../../lib/utils';
import { TXMined } from '../../types/transaction';

const ModalContent = ({ setShowDialog }: { setShowDialog: (value: boolean) => void }) => {
  const [step, setStep] = useState('default');
  const [txId, setTxId] = useState(null);
  const [burnAmount, setBurnAmount] = useState('');
  // const { data: mkrBalance } = useSWR(['/user/mkr-balance', address?.address], (_, account) =>
  //   getMaker().then(maker => maker.getToken(MKR).balanceOf(account))
  // );

  const [track, tx] = useTransactionStore(
    state => [state.track, txId ? transactionsSelectors.getTransaction(state, txId) : null],
    shallow
  );
  const bpi = useBreakpointIndex();
  const close = () => {
    setShowDialog(false);
  };
  const shutdown = async () => {
    const maker = await getMaker();
    const esm = await maker.service('esm');
    const shutdownTxObject = esm.triggerEmergencyShutdown();
    const txId = await track(shutdownTxObject, 'Shutting Down Dai Credit System', {
      pending: txHash => {
        setStep('pending');
      },
      mined: txId => {
        transactionsApi.getState().setMessage(txId, 'Dai Credit System has been Shutdown');
        close(); // TBD maybe show a separate "done" dialog
      },
      error: () => setStep('failed')
    });

    setTxId(txId);
    setStep('signing');
  };

  const DefaultScreen = () => (
    <Flex sx={{ flexDirection: 'column', alignItems: 'center' }}>
      <Close onClick={() => setShowDialog(false)} sx={{ alignSelf: 'flex-end' }} />
      <Icon ml={2} name="warning" size={5} sx={{ color: 'notice' }} />
      <Text variant="heading" mt={4}>
        Shutting down the Dai Credit System
      </Text>
      <Text variant="text" sx={{ mt: 3 }}>
        The 50,000 MKR limit for the emergency shutdown module has been reached. By continuing past this
        alert, emergency shutdown will be initiated for the Dai Credit System.
      </Text>
      <Grid columns={2} mt={4}>
        <Button
          onClick={close}
          variant="outline"
          sx={{ color: '#9FAFB9', borderColor: '#9FAFB9', borderRadius: 'small' }}
        >
          Cancel
        </Button>
        <Button
          onClick={shutdown}
          variant="outline"
          sx={{ color: 'onNotice', borderColor: 'notice', borderRadius: 'small' }}
        >
          Continue
        </Button>
      </Grid>
    </Flex>
  );

  const ShutdownSigning = () => (
    <Flex sx={{ flexDirection: 'column', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
      <Close
        aria-label="close"
        sx={{ height: '20px', width: '20px', p: 0, alignSelf: 'flex-end' }}
        onClick={close}
      />

      <Text variant="heading" sx={{ fontSize: 6 }}>
        Sign TX to start Emergency Shutdown.
      </Text>
      <Flex sx={{ flexDirection: 'column', alignItems: 'center' }}>
        <Spinner size="60px" sx={{ color: 'primary', alignSelf: 'center', my: 4 }} />
        <Text sx={{ color: 'onSecondary', fontWeight: 'medium', fontSize: 3 }}>
          Please use your wallet to sign this transaction.
        </Text>
        <Button onClick={close} variant="textual" sx={{ mt: 3, color: 'muted', fontSize: 2 }}>
          Cancel shutdown submission
        </Button>
      </Flex>
    </Flex>
  );

  const ShutdownPending = () => (
    <Flex sx={{ flexDirection: 'column', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
      <Close
        aria-label="close"
        sx={{ height: '20px', width: '20px', p: 0, alignSelf: 'flex-end' }}
        onClick={close}
      />

      <Text variant="heading" sx={{ fontSize: 6 }}>
        Transaction Sent!
      </Text>
      <Flex sx={{ flexDirection: 'column', alignItems: 'center' }}>
        <Icon name="reviewCheck" size={5} sx={{ my: 4 }} />
        <Text sx={{ color: 'onSecondary', fontWeight: 'medium', fontSize: '16px', textAlign: 'center' }}>
          Shutdown will update once the blockchain has confirmed the transaction.
        </Text>
        <Link
          target="_blank"
          href={getEtherscanLink(getNetwork(), (tx as TXMined).hash, 'transaction')}
          sx={{ p: 0 }}
        >
          <Text mt={3} px={4} sx={{ textAlign: 'center', fontSize: 14, color: 'accentBlue' }}>
            View on Etherscan
            <Icon name="arrowTopRight" pt={2} color="accentBlue" />
          </Text>
        </Link>
        <Button
          onClick={close}
          sx={{ mt: 4, borderColor: 'primary', width: '100%', color: 'primary' }}
          variant="outline"
        >
          Close
        </Button>
      </Flex>
    </Flex>
  );

  const ShutdownFailed = () => (
    <Flex sx={{ flexDirection: 'column', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
      <Close
        aria-label="close"
        sx={{ height: '20px', width: '20px', p: 0, alignSelf: 'flex-end' }}
        onClick={close}
      />
      <Text variant="heading" sx={{ fontSize: 6 }}>
        Transaction Failed.
      </Text>
      <Flex sx={{ flexDirection: 'column', alignItems: 'center' }}>
        <Icon name="reviewFailed" size={5} sx={{ my: 3 }} />
        <Text sx={{ color: 'onSecondary', fontWeight: 'medium', fontSize: '16px' }}>
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

  switch (step) {
    case 'default':
      return <DefaultScreen />;
    case 'signing':
      return <ShutdownSigning />;
    case 'pending':
      return <ShutdownPending />;
    case 'failed':
      return <ShutdownFailed />;
    default:
      return <DefaultScreen />;
  }
};

export default ModalContent;
