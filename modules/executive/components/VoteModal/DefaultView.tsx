import { useBreakpointIndex } from '@theme-ui/match-media';
import BigNumber from 'bignumber.js';
import { fetchJson } from 'lib/fetchJson';
import getMaker, { getNetwork, personalSign } from 'lib/maker';
import { sortBytesArray } from 'lib/utils';
import { ANALYTICS_PAGES } from 'modules/app/client/analytics/analytics.constants';
import { useAnalytics } from 'modules/app/client/analytics/useAnalytics';
import SkeletonThemed from 'modules/app/components/SkeletonThemed';
import useAccountsStore from 'modules/app/stores/accounts';
import useTransactionsStore, { transactionsApi } from 'modules/app/stores/transactions';
import { ExecutiveCommentsRequestBody } from 'modules/comments/types/executiveComment';
import { useAllSlates } from 'modules/executive/hooks/useAllSlates';
import { useHat } from 'modules/executive/hooks/useHat';
import { useMkrOnHat } from 'modules/executive/hooks/useMkrOnHat';
import { useSpellData } from 'modules/executive/hooks/useSpellData';
import { useVotedProposals } from 'modules/executive/hooks/useVotedProposals';
import { CMSProposal, Proposal } from 'modules/executive/types';
import { useLockedMkr } from 'modules/mkr/hooks/useLockedMkr';
import React, { useEffect, useState } from 'react';
import { Grid, Button, Flex, Close, Text, Box, Label, Checkbox, Textarea } from 'theme-ui';
import shallow from 'zustand/shallow';

export default function DefaultVoteModalView({
  proposal,
  onTransactionPending,
  onTransactionMined,
  onTransactionCreated,
  onTransactionFailed
}: {
  proposal: Proposal;
  onTransactionPending: () => void;
  onTransactionMined: () => void;
  onTransactionFailed: () => void;
  onTransactionCreated: (txId: string) => void;
}): React.ReactElement {
  const { trackButtonClick } = useAnalytics(ANALYTICS_PAGES.EXECUTIVE);
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

  const [hatChecked, setHatChecked] = useState(true);
  const { data: currentSlate, mutate: mutateVotedProposals } = useVotedProposals();

  const [comment, setComment] = useState('');
  const [signedMessage, setSignedMessage] = useState('');

  const signComment = async () => {
    const signed = await personalSign(comment);
    setSignedMessage(signed);
  };

  const track = useTransactionsStore(state => state.track, shallow);

  const { data: allSlates } = useAllSlates();
  const { mutate: mutateMkrOnHat } = useMkrOnHat();

  const { data: hat } = useHat();
  const isHat = hat && hat === proposal.address;
  const showHatCheckbox =
    hat && proposal.address !== hat && currentSlate.includes(hat) && !currentSlate.includes(proposal.address);
  const votingWeight = lockedMkr?.toBigNumber().toFormat(6);
  const hasVotingWeight = lockedMkr?.toBigNumber().gt(0);
  const mkrSupporting = spellData ? new BigNumber(spellData.mkrSupport).toFormat(3) : 0;
  const afterVote = currentSlate && currentSlate.includes(proposal.address)
    ? mkrSupporting
    : lockedMkr && spellData
    ? lockedMkr.toBigNumber().plus(new BigNumber(spellData.mkrSupport)).toFormat(3)
    : 0;

  const vote = async hatChecked => {
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

    const txId = await track(voteTxCreator, 'Voting on executive proposal', {
      pending: txHash => {
        // if comment included, add to comments db
        if (comment.length > 0) {
          const requestBody: ExecutiveCommentsRequestBody = {
            voterAddress: account?.address || '',
            delegateAddress: voteDelegate ? voteDelegate.getVoteDelegateAddress() : '',
            comment: comment,
            signedMessage: signedMessage,
            txHash,
            voterWeight: votingWeight
          };
          fetchJson(`/api/comments/executive/add/${proposal.address}?network=${getNetwork()}`, {
            method: 'POST',
            body: JSON.stringify(requestBody)
          })
            .then(() => console.log('comment successfully added'))
            .catch(() => console.error('failed to add comment'));
        }

        onTransactionPending();
      },
      mined: txId => {
        transactionsApi.getState().setMessage(txId, 'Voted on executive proposal');
        mutateVotedProposals();
        mutateMkrOnHat();
        onTransactionMined();
      },
      error: () => {
        onTransactionFailed();
      }
    });

    onTransactionCreated(txId);
  };

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

  const votingMessage =
    currentSlate && currentSlate.includes(proposal.address) && currentSlate.length > 1
      ? 'Concentrate all my MKR on this proposal'
      : currentSlate && !currentSlate.includes(proposal.address) && isHat
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
              <SkeletonThemed />
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
              <SkeletonThemed />
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
              <SkeletonThemed />
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
            onChange={event => {
              setComment(event.target.value);
              setSignedMessage('');
            }}
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
                // sign comments
                signComment();
              }}
              variant="primaryOutline"
              disabled={comment.length > 250 || !hasVotingWeight || signedMessage.length > 0}
              sx={{ width: '100%' }}
            >
              1 - Sign your comment
            </Button>
            <Button
              mt={2}
              onClick={() => {
                trackButtonClick('vote');
                vote(hatChecked);
              }}
              variant="primaryLarge"
              disabled={comment.length > 250 || !hasVotingWeight || !signedMessage}
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
              vote(hatChecked);
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
}
