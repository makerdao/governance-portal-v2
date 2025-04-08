/*

SPDX-FileCopyrightText: © 2023 Dai Foundation <www.daifoundation.org>

SPDX-License-Identifier: AGPL-3.0-or-later

*/

import { Flex, Button, Text, Grid, Close, Spinner } from 'theme-ui';
import { useState } from 'react';
import { formatValue } from 'lib/string';
import Icon from 'modules/app/components/Icon';
import { useEsmShutdown } from '../hooks/useEsmShutdown';
import EtherscanLink from 'modules/web3/components/EtherscanLink';
import { useNetwork } from 'modules/app/hooks/useNetwork';

const ModalContent = ({
  setShowDialog,
  thresholdAmount
}: {
  setShowDialog: (value: boolean) => void;
  thresholdAmount?: bigint;
}): React.ReactElement => {
  const [step, setStep] = useState('default');
  const [txHash, setTxHash] = useState<`0x${string}` | undefined>();

  const network = useNetwork();
  const shutdown = useEsmShutdown({
    onStart: (hash: `0x${string}`) => {
      setTxHash(hash);
      setStep('pending');
    },
    onSuccess: (hash: `0x${string}`) => {
      setTxHash(hash);
      close(); // TBD maybe show a separate "done" dialog,
    },
    onError: () => {
      setStep('failed');
    }
  });

  const close = () => {
    setShowDialog(false);
  };

  const DefaultScreen = () => (
    <Flex sx={{ flexDirection: 'column', alignItems: 'center' }}>
      <Close onClick={() => setShowDialog(false)} sx={{ alignSelf: 'flex-end' }} />
      <Icon name="warning" size={5} sx={{ color: 'notice', ml: 2 }} />
      <Text variant="heading" mt={4}>
        Shutting down the Dai Credit System
      </Text>
      <Text variant="text" sx={{ mt: 3 }}>
        The {thresholdAmount ? `${formatValue(thresholdAmount)}` : '---'} MKR limit for the emergency shutdown
        module has been reached. By continuing past this alert, emergency shutdown will be initiated for the
        Dai Credit System.
      </Text>
      <Grid columns={2} mt={4}>
        <Button onClick={close} variant="outline" sx={{ color: '#9FAFB9', borderColor: '#9FAFB9' }}>
          Cancel
        </Button>
        <Button
          disabled={shutdown.isLoading || !shutdown.prepared}
          onClick={() => {
            setStep('signing');
            shutdown.execute();
          }}
          variant="outline"
          sx={{ color: 'onNotice', borderColor: 'notice' }}
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
        <Spinner size={60} sx={{ color: 'primary', alignSelf: 'center', my: 4 }} />
        <Text sx={{ color: 'onSecondary', fontWeight: 'medium', fontSize: 3 }}>
          Please use your wallet to sign this transaction.
        </Text>
        <Button onClick={close} variant="textual" sx={{ mt: 3, color: 'secondary', fontSize: 2 }}>
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
          Shutdown will update once the transaction has been confirmed.
        </Text>

        {txHash && <EtherscanLink hash={txHash} type="transaction" network={network} />}

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
