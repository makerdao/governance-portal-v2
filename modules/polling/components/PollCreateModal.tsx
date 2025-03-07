/*

SPDX-FileCopyrightText: © 2023 Dai Foundation <www.daifoundation.org>

SPDX-License-Identifier: AGPL-3.0-or-later

*/

import { useState, useMemo } from 'react';
import { Button, Flex, Close, Text, Box, Spinner } from 'theme-ui';
import { Icon } from '@makerdao/dai-ui-icons';
import { DialogOverlay, DialogContent } from 'modules/app/components/Dialog';

import { Poll } from 'modules/polling/types';
import { useNetwork } from 'modules/app/hooks/useNetwork';
import { usePollCreate } from '../hooks/usePollCreate';
import EtherscanLink from 'modules/web3/components/EtherscanLink';

type Props = {
  close: () => void;
  poll: Poll | undefined;
  setPoll: (poll: Poll | undefined) => void;
};

const PollCreateModal = ({ close, poll, setPoll }: Props): JSX.Element => {
  const [step, setStep] = useState('confirm');
  const [txHash, setTxHash] = useState<`0x${string}` | undefined>();

  const createPoll = usePollCreate({
    startDate: poll && BigInt(poll.startDate.getTime() / 1000),
    endDate: poll && BigInt(poll.endDate.getTime() / 1000),
    multiHash: poll && poll.multiHash,
    url: poll && poll.url,
    onStart: (hash: `0x${string}`) => {
      setTxHash(hash);
      setStep('pending');
    },
    onSuccess: (hash: `0x${string}`) => {
      setTxHash(hash);
      setPoll(undefined);
      close();
    },
    onError: () => {
      setStep('failed');
    }
  });

  const Default = () => {
    return (
      <Flex sx={{ flexDirection: 'column', justifyContent: 'space-between', alignItems: 'center' }}>
        <Close
          aria-label="close"
          sx={{ height: '20px', width: '20px', p: 0, alignSelf: 'flex-end' }}
          onClick={close}
        />

        <Text variant="heading" sx={{ fontSize: 6 }}>
          Create Poll
        </Text>
        <Text sx={{ display: ['none', 'block'], marginTop: 3, color: 'onSecondary', fontSize: [3, 4] }}>
          You are creating the following poll:
        </Text>
        <Box sx={{ width: '100%', my: 3 }}>
          <Box
            sx={{
              borderRadius: 'medium',
              my: 2,
              mb: 4,
              width: '100%',
              borderColor: 'secondaryMuted'
            }}
          >
            <Text sx={{ fontWeight: 'bold', fontSize: '16px', textAlign: 'center' }}>{poll?.title}</Text>
          </Box>
        </Box>
        <Box sx={{ width: '100%', mt: 3 }}>
          <Button
            variant="primaryLarge"
            sx={{ width: '100%' }}
            disabled={!poll || createPoll.isLoading || !createPoll.prepared}
            onClick={() => {
              setStep('signing');
              createPoll.execute();
            }}
          >
            Create Poll
          </Button>
        </Box>
      </Flex>
    );
  };

  const view = useMemo(() => {
    switch (step) {
      case 'confirm':
        return <Default />;
      case 'signing':
        return <Signing close={close} />;
      case 'pending':
        return <Pending txHash={txHash} close={close} />;
      case 'failed':
        return <Error close={close} />;
    }
  }, [step, txHash, createPoll.isLoading, createPoll.prepared, createPoll.execute]);

  return (
    <DialogOverlay isOpen onDismiss={close}>
      <DialogContent ariaLabel="Executive Vote">{view}</DialogContent>
    </DialogOverlay>
  );
};

const Signing = ({ close }) => (
  <Flex sx={{ flexDirection: 'column', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
    <Close
      aria-label="close"
      sx={{ height: '20px', width: '20px', p: 0, alignSelf: 'flex-end' }}
      onClick={close}
    />

    <Text variant="heading" sx={{ fontSize: 6 }}>
      Sign Transaction
    </Text>
    <Flex sx={{ flexDirection: 'column', alignItems: 'center' }}>
      <Spinner size="60px" sx={{ color: 'primary', alignSelf: 'center', my: 4 }} />
      <Text sx={{ color: 'onSecondary', fontWeight: 'medium', fontSize: 3 }}>
        Please use your wallet to sign this transaction.
      </Text>
    </Flex>
  </Flex>
);

const Pending = ({ txHash, close }: { txHash: `0x${string}` | undefined; close: () => void }) => {
  const network = useNetwork();

  return (
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
          Poll will be created once the transaction has been confirmed.
        </Text>

        {txHash && <EtherscanLink type="transaction" hash={txHash} network={network} />}

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
};

const Error = ({ close }) => (
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

export default PollCreateModal;
