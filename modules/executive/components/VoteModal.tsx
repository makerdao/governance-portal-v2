import { useState, useMemo, useEffect } from 'react';
import {
  Grid,
  Button,
  Flex,
  Close,
  Text,
  Box,
  Link as ExternalLink,
  Label,
  Checkbox,
  Textarea
} from 'theme-ui';
import { useBreakpointIndex } from '@theme-ui/match-media';
import { DialogOverlay, DialogContent } from '@reach/dialog';
import shallow from 'zustand/shallow';
import Bignumber from 'bignumber.js';
import Skeleton from 'modules/app/components/SkeletonThemed';
import { Icon } from '@makerdao/dai-ui-icons';

import getMaker, { personalSign } from 'lib/maker';
import { fadeIn, slideUp } from 'lib/keyframes';
import { sortBytesArray } from 'lib/utils';
import { fetchJson } from 'lib/fetchJson';
import { useLockedMkr } from 'modules/mkr/hooks/useLockedMkr';
import { useHat } from 'modules/executive/hooks/useHat';
import { useAllSlates } from 'modules/executive/hooks/useAllSlates';
import useAccountsStore from 'modules/app/stores/accounts';
import useTransactionStore, { transactionsApi, transactionsSelectors } from 'modules/app/stores/transactions';
import { Proposal, CMSProposal } from 'modules/executive/types';
import { useAnalytics } from 'modules/app/client/analytics/useAnalytics';
import { ANALYTICS_PAGES } from 'modules/app/client/analytics/analytics.constants';
import { useSpellData } from '../hooks/useSpellData';
import { TxInProgress } from 'modules/app/components/TxInProgress';
import { TxFinal } from 'modules/app/components/TxFinal';
import { useMkrOnHat } from '../hooks/useMkrOnHat';

type Props = {
  close: () => void;
  proposal: Proposal;
  currentSlate?: string[];
  onMined?: any;
};

type ModalStep = 'confirm' | 'signing' | 'pending' | 'mined' | 'failed';

const VoteModal = ({ close, proposal, currentSlate = [], onMined }: Props): JSX.Element => {
  const [txId, setTxId] = useState(null);
  const bpi = useBreakpointIndex();
  const account = useAccountsStore(state => state.currentAccount);
  const [voteProxy, voteDelegate] = useAccountsStore(state =>
    account ? [state.proxies[account.address], state.voteDelegate] : [null, null]
  );
  const addressLockedMKR =
    voteDelegate?.getVoteDelegateAddress() || voteProxy?.getProxyAddress() || account?.address;
  const { data: lockedMkr, mutate: mutateLockedMkr } = useLockedMkr(
    addressLockedMKR,
    voteProxy,
    voteDelegate
  );
  const { data: spellData, mutate: mutateSpellData } = useSpellData(proposal.address);

  // revalidate on mount
  useEffect(() => {
    mutateLockedMkr();
    mutateSpellData();
  }, []);

  const [track, tx] = useTransactionStore(
    state => [state.track, txId ? transactionsSelectors.getTransaction(state, txId) : null],
    shallow
  );
  const { data: allSlates } = useAllSlates();
  const { mutate: mutateMkrOnHat } = useMkrOnHat();

  const { data: hat } = useHat();
  const isHat = hat && hat === proposal.address;
  const showHatCheckbox =
    hat && proposal.address !== hat && currentSlate.includes(hat) && !currentSlate.includes(proposal.address);
  const votingWeight = lockedMkr?.toBigNumber().toFormat(6);
  const hasVotingWeight = lockedMkr?.toBigNumber().gt(0);
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

  const [step, setStep] = useState<ModalStep>('confirm');

  const vote = async (hatChecked, comment) => {
    const maker = await getMaker();
    const proposals =
      hatChecked && showHatCheckbox ? sortBytesArray([hat, proposal.address]) : [proposal.address];

    const encodedParam = maker.service('web3')._web3.eth.abi.encodeParameter('address[]', proposals);
    const slate = maker.service('web3')._web3.utils.sha3('0x' + encodedParam.slice(-64 * proposals.length));
    const slateAlreadyExists = allSlates && allSlates.findIndex(l => l === slate) > -1;
    const slateOrProposals = slateAlreadyExists ? slate : proposals;
    const voteTxCreator = voteDelegate
      ? () => voteDelegate.voteExec(slateOrProposals)
      : voteProxy
      ? () => voteProxy.voteExec(slateOrProposals)
      : () => maker.service('chief').vote(slateOrProposals);

    const commentSig = comment.length > 0 ? await personalSign(comment) : '';

    const txId = await track(voteTxCreator, 'Voting on executive proposal', {
      pending: txHash => {
        setStep('pending');
        // if comment included, add to comments db
        if (comment.length > 0) {
          fetchJson(`/api/comments/executive/add/${proposal.address}`, {
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
        onMined && onMined();
        mutateMkrOnHat();
        setStep('mined');
      },
      error: () => setStep('failed')
    });

    setTxId(txId);
    setStep('signing');
  };

  const Default = () => {
    const { trackButtonClick } = useAnalytics(ANALYTICS_PAGES.EXECUTIVE);

    const [hatChecked, setHatChecked] = useState(true);
    const [comment, setComment] = useState('');

    const votingMessage =
      currentSlate.includes(proposal.address) && currentSlate.length > 1
        ? 'Concentrate all my MKR on this proposal'
        : !currentSlate.includes(proposal.address) && isHat
        ? 'Add MKR to secure the protocol'
        : 'Submit Vote';
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
            <Text as="p" color="onSecondary" sx={{ fontSize: 3 }}>
              Your voting weight
            </Text>
            {lockedMkr ? (
              <Text as="p" color="text" mt={[0, 2]} sx={{ fontSize: 3, fontWeight: 'medium' }}>
                {votingWeight} MKR
              </Text>
            ) : (
              <Box sx={{ mt: [0, 2] }}>
                <Skeleton />
              </Box>
            )}
          </GridBox>
          <GridBox bpi={bpi}>
            <Text as="p" color="onSecondary" sx={{ fontSize: 3 }}>
              MKR supporting
            </Text>
            {spellData ? (
              <Text as="p" color="text" mt={[0, 2]} sx={{ fontSize: 3, fontWeight: 'medium' }}>
                {mkrSupporting} MKR
              </Text>
            ) : (
              <Box sx={{ mt: [0, 2] }}>
                <Skeleton />
              </Box>
            )}
          </GridBox>
          <Box sx={{ height: ['64px', '78px'], p: 3, pt: 2 }}>
            <Text as="p" color="onSecondary" sx={{ fontSize: 3 }}>
              After vote cast
            </Text>
            {lockedMkr && spellData ? (
              <Text as="p" color="text" mt={[0, 2]} sx={{ fontSize: 3, fontWeight: 'medium' }}>
                {afterVote} MKR
              </Text>
            ) : (
              <Box sx={{ mt: [0, 2] }}>
                <Skeleton />
              </Box>
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
              borderColor: 'secondaryMuted'
            }}
          >
            <Label variant="microHeading" sx={{ fontSize: 3, mb: 1 }}>
              Why are you voting for this proposal?
            </Label>
            <Textarea
              sx={{
                color: 'text',
                height: '96px',
                justifyContent: 'flex-start',
                alignItems: 'flex-start',
                display: 'flex',
                resize: 'none'
              }}
              onChange={event => setComment(event.target.value)}
            />

            <Text
              as="p"
              variant="text"
              sx={{ fontSize: 1, color: comment.length > 250 ? 'error' : 'textMuted', mt: 1 }}
            >
              Optional. You&apos;ll be prompted to sign a message with your wallet. {250 - comment.length}{' '}
              characters remaining.
            </Text>
          </Box>
        </Box>
        <Box sx={{ width: '100%' }}>
          {comment.length > 0 ? (
            <Box>
              <Button
                onClick={() => {
                  // SIgn comments
                }}
                variant="primaryOutline"
                disabled={comment.length > 250 || !hasVotingWeight}
                sx={{ width: '100%' }}
              >
                1 - Sign your comment
              </Button>
              <Button
                mt={2}
                onClick={() => {
                  trackButtonClick('vote');
                  vote(hatChecked, comment);
                }}
                variant="primaryLarge"
                disabled={comment.length > 250 || !hasVotingWeight}
                sx={{ width: '100%' }}
              >
                2 - {votingMessage}
              </Button>
            </Box>
          ) : (
            <Button
              variant="primaryLarge"
              sx={{ width: '100%' }}
              onClick={() => {
                trackButtonClick('vote');
                vote(hatChecked, comment);
              }}
              disabled={!hasVotingWeight}
            >
              {votingMessage}
            </Button>
          )}
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
        return <TxInProgress tx={tx} txPending={false} setTxId={close} />;
      case 'pending':
        return <TxInProgress tx={tx} txPending={true} setTxId={close} />;
      case 'mined':
        return (
          <TxFinal
            title="Transaction Sent"
            description="Your vote will be reflected once the transaction has been confirmed."
            buttonLabel="Close"
            onClick={close}
            tx={tx}
            success={true}
          />
        );
      case 'failed':
        return <Error close={close} />;
    }
  }, [step, lockedMkr, spellData, tx, bpi]);

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
