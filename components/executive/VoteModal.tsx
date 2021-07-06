/** @jsx jsx */
import { useState, useMemo } from 'react';
import useSWR from 'swr';
import {
  Grid,
  Button,
  Flex,
  Close,
  Text,
  Box,
  Spinner,
  Link as ExternalLink,
  Label,
  Checkbox,
  jsx,
  Textarea
} from 'theme-ui';
import { useBreakpointIndex } from '@theme-ui/match-media';
import { DialogOverlay, DialogContent } from '@reach/dialog';
import mixpanel from 'mixpanel-browser';
import shallow from 'zustand/shallow';
import Bignumber from 'bignumber.js';
import Skeleton from 'react-loading-skeleton';
import { Icon } from '@makerdao/dai-ui-icons';

import getMaker, { getNetwork, personalSign } from 'lib/maker';
import { fadeIn, slideUp } from 'lib/keyframes';
import { getEtherscanLink, sortBytesArray, fetchJson } from 'lib/utils';
import { useLockedMkr } from 'lib/hooks';
import useAccountsStore from 'stores/accounts';
import useTransactionStore, { transactionsApi, transactionsSelectors } from 'stores/transactions';
import { SpellData } from 'types/spellData';
import { TXMined } from 'types/transaction';
import { Proposal, CMSProposal } from 'types/proposal';

type Props = {
  close: () => void;
  proposal: Proposal;
  currentSlate?: string[];
};

type ModalStep = 'confirm' | 'signing' | 'pending' | 'failed';

const VoteModal = ({ close, proposal, currentSlate = [] }: Props): JSX.Element => {
  const [txId, setTxId] = useState(null);
  const bpi = useBreakpointIndex();
  const account = useAccountsStore(state => state.currentAccount);
  const [voteProxy, delegateInfo] = useAccountsStore(state =>
    account ? [state.proxies[account.address], state.delegateInfo] : [null, null]
  );
  const voteDelegateAddress = delegateInfo?.voteDelegate._delegateAddress;
  const lockedMkrKey = voteDelegateAddress || voteProxy?.getProxyAddress() || account?.address;
  const { data: lockedMkr } = useLockedMkr({ lockedMkrKey, voteProxy, voteDelegateAddress });

  const { data: spellData } = useSWR<SpellData>(
    `/api/executive/analyze-spell/${proposal.address}?network=${getNetwork()}`
  );

  const [track, tx] = useTransactionStore(
    state => [state.track, txId ? transactionsSelectors.getTransaction(state, txId) : null],
    shallow
  );

  const { data: slateLogs } = useSWR('/executive/all-slates', () =>
    getMaker().then(maker => maker.service('chief').getAllSlates())
  );

  const { data: hat } = useSWR<string>('/executive/hat', () =>
    getMaker().then(maker => maker.service('chief').getHat())
  );

  const isHat = hat && hat === proposal.address;

  const showHatCheckbox =
    hat && proposal.address !== hat && currentSlate.includes(hat) && !currentSlate.includes(proposal.address);

  const votingWeight = lockedMkr?.toBigNumber().toFormat(6);
  const mkrSupporting = spellData ? new Bignumber(spellData.mkrSupport).toFormat(3) : 0;
  const afterVote = currentSlate.includes(proposal.address)
    ? mkrSupporting
    : lockedMkr && spellData
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

  const vote = async (hatChecked, comment) => {
    const maker = await getMaker();
    const proposals =
      hatChecked && showHatCheckbox ? sortBytesArray([hat, proposal.address]) : [proposal.address];

    const encodedParam = maker.service('web3')._web3.eth.abi.encodeParameter('address[]', proposals);
    const slate = maker.service('web3')._web3.utils.sha3('0x' + encodedParam.slice(-64 * proposals.length));
    const slateAlreadyExists = slateLogs && slateLogs.findIndex(l => l === slate) > -1;
    const slateOrProposals = slateAlreadyExists ? slate : proposals;
    const voteTxCreator = voteProxy
      ? () => voteProxy.voteExec(slateOrProposals)
      : () => maker.service('chief').vote(slateOrProposals);

    const commentSig = comment.length > 0 ? await personalSign(comment) : '';

    const txId = await track(voteTxCreator, 'Voting on executive proposal', {
      pending: txHash => {
        setStep('pending');
        if (comment.length > 0) {
          fetchJson(`/api/executive/comments/add/${proposal.address}`, {
            method: 'POST',
            body: JSON.stringify({
              voterAddress: account?.address,
              comment: comment,
              commentSig: commentSig,
              txHash,
              voterWeight: votingWeight
            })
          })
            .then(() => console.log('comment successfully added'))
            .catch(() => console.error('failed to add comment'));
        }
      },
      mined: txId => {
        transactionsApi.getState().setMessage(txId, 'Voted on executive proposal');
        close(); // TBD maybe show a separate "done" dialog
      },
      error: () => setStep('failed')
    });

    setTxId(txId);
    setStep('signing');
  };

  const Default = () => {
    const [hatChecked, setHatChecked] = useState(true);
    const [comment, setComment] = useState('');
    return (
      <Flex sx={{ flexDirection: 'column', justifyContent: 'space-between', alignItems: 'center' }}>
        <Close
          aria-label="close"
          sx={{ height: '20px', width: '20px', p: 0, alignSelf: 'flex-end' }}
          onClick={close}
        />

        <Text variant="heading" sx={{ fontSize: 6 }}>
          Confirm Vote
        </Text>
        <Text sx={{ display: ['none', 'block'], marginTop: 3, color: 'onSecondary', fontSize: [3, 4] }}>
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
            fontSize: [3, 4]
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
            {lockedMkr ? (
              <Text color="text" m={[1, 2]} sx={{ fontSize: 3, fontWeight: 'medium' }}>
                {votingWeight} MKR
              </Text>
            ) : (
              <Text color="onSecondary" sx={{ fontSize: 3, m: [1, 2], width: 6 }}>
                <Skeleton />
              </Text>
            )}
          </GridBox>
          <GridBox bpi={bpi}>
            <Text color="onSecondary" sx={{ fontSize: 3 }}>
              MKR supporting
            </Text>
            {spellData ? (
              <Text color="text" m={[1, 2]} sx={{ fontSize: 3, fontWeight: 'medium' }}>
                {mkrSupporting} MKR
              </Text>
            ) : (
              <Text color="onSecondary" sx={{ fontSize: 3, m: [1, 2], width: 6 }}>
                <Skeleton />
              </Text>
            )}
          </GridBox>
          <Box sx={{ height: ['64px', '78px'], p: 3, pt: 2 }}>
            <Text color="onSecondary" sx={{ fontSize: 3 }}>
              After vote cast
            </Text>
            {lockedMkr && spellData ? (
              <Text color="text" m={[1, 2]} sx={{ fontSize: 3, fontWeight: 'medium' }}>
                {afterVote} MKR
              </Text>
            ) : (
              <Text color="onSecondary" sx={{ fontSize: 3, m: [1, 2], width: 6 }}>
                <Skeleton />
              </Text>
            )}
          </Box>
        </Grid>
        <Box sx={{ width: '100%', my: 3 }}>
          <Box
            sx={{
              borderRadius: 'medium',
              my: 2,
              mb: 4,
              width: '100%',
              borderColor: 'secondaryMuted',
              height: '96px'
            }}
          >
            <Label variant="microHeading" sx={{ fontSize: 3 }}>
              Why are you voting for this proposal?
            </Label>
            <Textarea
              sx={{
                color: 'secondaryMuted',
                height: '96px',
                justifyContent: 'flex-start',
                alignItems: 'flex-start',
                display: 'flex',
                resize: 'none'
              }}
              onChange={event => setComment(event.target.value)}
              placeholder="Optional. 250 character max. You'll be prompted to sign a message with your wallet."
            />
            <Text variant="text" sx={{ fontSize: 1, color: comment.length > 250 ? 'error' : 'textMuted' }}>
              {250 - comment.length} characters remaining
            </Text>
          </Box>
        </Box>
        <Box sx={{ width: '100%', mt: 3 }}>
          <Button
            variant="primaryLarge"
            sx={{ width: '100%' }}
            onClick={() => {
              mixpanel.track('btn-click', {
                id: 'vote',
                product: 'governance-portal-v2',
                page: 'Executive'
              });
              vote(hatChecked, comment);
            }}
            disabled={comment.length > 250}
          >
            {currentSlate.includes(proposal.address) && currentSlate.length > 1
              ? 'Concentrate all my MKR on this proposal'
              : !currentSlate.includes(proposal.address) && isHat
              ? 'Add MKR to secure the protocol'
              : 'Submit Vote'}
          </Button>
          {showHatCheckbox ? (
            <Label
              sx={{
                mt: 3,
                p: 0,
                fontWeight: 400,
                alignItems: 'center',
                color: 'textSecondary',
                lineHeight: '0px',
                fontSize: [1, 2]
              }}
            >
              <Checkbox
                sx={{ width: '18px', height: '18px' }}
                checked={hatChecked}
                onChange={event => {
                  setHatChecked(event.target.checked);
                }}
              />
              Keep my MKR on old proposal to secure the Maker protocol
            </Label>
          ) : null}
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
  }, [step, lockedMkr, spellData, tx]);

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
      {/* <Button variant="textual" sx={{ mt: 3, color: 'muted', fontSize: 2 }}>
        Cancel vote submission
      </Button> */}
    </Flex>
  </Flex>
);

const Pending = ({ tx, close }) => (
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
        Vote will update once the blockchain has confirmed the transaction.
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

export default VoteModal;
