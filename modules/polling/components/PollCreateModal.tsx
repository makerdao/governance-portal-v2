import { useState, useMemo } from 'react';
import { Button, Flex, Close, Text, Box, Spinner, Link as ExternalLink } from 'theme-ui';
import { Icon } from '@makerdao/dai-ui-icons';
import shallow from 'zustand/shallow';
import { useBreakpointIndex } from '@theme-ui/match-media';
import { DialogOverlay, DialogContent } from '@reach/dialog';

import { fadeIn, slideUp } from 'lib/keyframes';
import getMaker from 'lib/maker';
import useTransactionStore, {
  transactionsApi,
  transactionsSelectors
} from 'modules/web3/stores/transactions';
import { getEtherscanLink } from 'modules/web3/helpers/getEtherscanLink';
import { TXMined } from 'modules/web3/types/transaction';
import { Poll } from 'modules/polling/types';
import { useActiveWeb3React } from 'modules/web3/hooks/useActiveWeb3React';
import { useAccount } from 'modules/app/hooks/useAccount';

type Props = {
  close: () => void;
  poll: Poll | undefined;
  setPoll: (any) => void;
};

const PollCreateModal = ({ close, poll, setPoll }: Props): JSX.Element => {
  const [txId, setTxId] = useState(null);
  const bpi = useBreakpointIndex();
  const { account } = useAccount();

  const [track, tx] = useTransactionStore(
    state => [state.track, txId ? transactionsSelectors.getTransaction(state, txId) : null],
    shallow
  );

  const [step, setStep] = useState('confirm');
  const createPoll = async () => {
    if (!poll) return;
    const maker = await getMaker();
    const voteTxCreator = () =>
      maker
        .service('govPolling')
        .createPoll(poll.startDate.getTime() / 1000, poll.endDate.getTime() / 1000, poll.multiHash, poll.url);
    const txId = await track(voteTxCreator, account, `Creating poll with id ${poll?.pollId}`, {
      pending: () => {
        setStep('pending');
      },
      mined: txId => {
        setPoll(undefined);
        transactionsApi.getState().setMessage(txId, 'Created poll');
        close();
      },
      error: () => setStep('failed')
    });
    setTxId(txId);
    setStep('signing');
  };

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
            onClick={() => {
              createPoll();
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
        return <Pending tx={tx} close={close} />;
      case 'failed':
        return <Error close={close} />;
    }
  }, [step, tx]);

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
        {view}
      </DialogContent>
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

const Pending = ({ tx, close }) => {
  const { network } = useActiveWeb3React();

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
        <ExternalLink
          target="_blank"
          href={getEtherscanLink(network, (tx as TXMined).hash, 'transaction')}
          sx={{ p: 0 }}
        >
          <Text as="p" mt={3} px={4} sx={{ textAlign: 'center', fontSize: 14, color: 'accentBlue' }}>
            View on Etherscan
            <Icon name="arrowTopRight" pt={2} color="accentBlue" />
          </Text>
        </ExternalLink>
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
