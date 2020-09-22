/** @jsx jsx */
import { useState, useMemo } from 'react';
import useSWR from 'swr';
import { Grid, Button, Flex, Close, Text, Box, Spinner, Link as ExternalLink, jsx } from 'theme-ui';
import { Icon } from '@makerdao/dai-ui-icons';
import { useBreakpointIndex } from '@theme-ui/match-media';
import { DialogOverlay, DialogContent } from '@reach/dialog';
import Bignumber from 'bignumber.js';
import SpellData from '../../types/spellData';
import getMaker, { getNetwork } from '../../lib/maker';
import useTransactionStore, { transactionsApi, transactionsSelectors } from '../../stores/transactions';
import { getEtherscanLink } from '../../lib/utils';
import { TXMined } from '../../types/transaction';
import shallow from 'zustand/shallow';
import useAccountsStore from '../../stores/accounts';
import Proposal, { CMSProposal } from '../../types/proposal';

type Props = {
  close: () => void;
  proposal: Proposal;
};

type ModalStep = 'confirm' | 'signing' | 'pending';

const VoteModal = ({ close, proposal }: Props): JSX.Element => {
  const [txId, setTxId] = useState(null);
  const bpi = useBreakpointIndex();
  const account = useAccountsStore(state => state.currentAccount);
  const { data: spellData } = useSWR<SpellData>(
    `/api/executive/analyze-spell/${proposal.address}?network=${getNetwork()}`
  );
  const { data: lockedMkr } = useSWR(
    account?.address ? ['/user/mkr-locked', account.address] : null,
    (_, address) => getMaker().then(maker => maker.service('chief').getNumDeposits(address))
  );

  const [track, tx] = useTransactionStore(
    state => [state.track, txId ? transactionsSelectors.getTransaction(state, txId) : null],
    shallow
  );

  const votingWeight = lockedMkr?.toBigNumber().toFormat(6);
  const mkrSupporting = spellData ? new Bignumber(spellData.mkrSupport).toFormat(3) : 0;
  const afterVote =
    lockedMkr && spellData
      ? lockedMkr.toBigNumber().plus(new Bignumber(spellData.mkrSupport)).toFormat(3)
      : 0;

  const GridBox = ({ bpi, children }) => (
    <Box
      sx={
        bpi === 0
          ? { height: '64px', p: 2, px: 3, width: '100%', borderBottom: '1px solid #D4D9E1' }
          : { height: '78px', px: 3, py: 2, borderRight: '1px solid #D4D9E1' }
      }
    >
      {children}
    </Box>
  );

  const [step, setStep] = useState('confirm');

  const vote = async () => {
    const maker = await getMaker();
    const voteTxCreator = () => maker.service('chief').vote(proposal.address);
    const txId = await track(voteTxCreator, 'Voting on executive proposal', {
      pending: () => setStep('pending'),
      mined: txId => {
        transactionsApi.getState().setMessage(txId, 'Voted on executive proposal');
        close(); // TBD maybe show a separate "done" dialog
      }
    });
    setTxId(txId);
    setStep('signing');
  };

  const Default = () => (
    <Flex sx={{ flexDirection: 'column', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
      <Close
        aria-label="close"
        sx={{ height: '20px', width: '20px', p: 0, alignSelf: 'flex-end' }}
        onClick={close}
      />

      <Text variant="heading" sx={{ fontSize: 6 }}>
        Confirm Vote
      </Text>
      <Text sx={{ marginTop: 3, color: 'onSecondary', fontSize: 4 }}>
        You are voting for the following executive proposal:
      </Text>
      <Box
        sx={{
          mt: 2,
          p: 3,
          width: '100%',
          mx: 3,
          backgroundColor: 'background',
          textAlign: 'center',
          fontSize: 4
        }}
      >
        <Text>{(proposal as CMSProposal).title}</Text>
      </Box>
      <Grid
        columns={[1, 3, 3, 3]}
        gap={0}
        sx={{
          width: '100%',
          minHeight: ['modal.height.mobile', 'modal.height.desktop'],
          borderRadius: 'small',
          border: '1px solid #D4D9E1',
          mt: 3,
          flexDirection: 'row',
          justifyContent: 'center',
          alignItems: 'center'
        }}
      >
        <GridBox bpi={bpi}>
          <Text color="onSecondary" sx={{ fontSize: 3 }}>
            Your voting weight
          </Text>
          <Text color="text" mt={[1, 2]} sx={{ fontSize: 3, fontWeight: 'medium' }}>
            {votingWeight} MKR
          </Text>
        </GridBox>
        <GridBox bpi={bpi}>
          <Text color="onSecondary" sx={{ fontSize: 3 }}>
            MKR supporting
          </Text>
          <Text color="text" mt={[1, 2]} sx={{ fontSize: 3, fontWeight: 'medium' }}>
            {mkrSupporting} MKR
          </Text>
        </GridBox>
        <Box sx={{ height: ['64px', '78px'], p: 3, pt: 2 }}>
          <Text color="onSecondary" sx={{ fontSize: 3 }}>
            After vote cast
          </Text>
          <Text color="text" mt={[1, 2]} sx={{ fontSize: 3, fontWeight: 'medium' }}>
            {afterVote} MKR
          </Text>
        </Box>
      </Grid>
      <Box sx={{ width: '100%', mt: 3 }}>
        <Button variant="primary" sx={{ width: '100%' }} onClick={vote}>
          Submit Vote
        </Button>
      </Box>
    </Flex>
  );

  const Signing = () => (
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
        <Button variant="textual" sx={{ mt: 3, color: 'muted', fontSize: 2 }}>
          Cancel vote submission
        </Button>
      </Flex>
    </Flex>
  );

  const Pending = () => (
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
        <Text sx={{ color: 'onSecondary', fontWeight: 'medium', fontSize: '16px' }}>
          Proposal will update once the blockchain has confirmed the tx.
        </Text>
        <ExternalLink
          target="_blank"
          href={getEtherscanLink(getNetwork(), (tx as TXMined).hash, 'transaction')}
          sx={{ p: 0 }}
        >
          <Text mt={3} px={4} sx={{ textAlign: 'center', fontSize: 14, color: 'accentBlue' }}>
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

  const view = useMemo(() => {
    switch (step) {
      case 'confirm':
        return <Default />;
      case 'signing':
        return <Signing />;
      case 'pending':
        return <Pending />;
      // case 'failed': return <Error />;
    }
  }, [step]);

  return (
    <DialogOverlay style={{ background: 'hsla(237.4%, 13.8%, 32.7%, 0.9)' }} onDismiss={close}>
      <DialogContent
        aria-label="Executive Vote"
        sx={
          bpi === 0
            ? { variant: 'dialog.mobile' }
            : { borderRadius: '8px', boxShadow: '0px 10px 50px hsla(0, 0%, 0%, 0.33)', width: '50em', p: 4 }
        }
      >
        {view}
      </DialogContent>
    </DialogOverlay>
  );
};

export default VoteModal;
