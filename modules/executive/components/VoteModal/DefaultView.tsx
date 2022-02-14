import { useBreakpointIndex } from '@theme-ui/match-media';
import { fetchJson } from 'lib/fetchJson';
import { sortBytesArray } from 'lib/utils';
import { ANALYTICS_PAGES } from 'modules/app/client/analytics/analytics.constants';
import { useAnalytics } from 'modules/app/client/analytics/useAnalytics';
import SkeletonThemed from 'modules/app/components/SkeletonThemed';
import CommentTextBox from 'modules/comments/components/CommentTextBox';
import { useExecutiveComments } from 'modules/comments/hooks/useExecutiveComments';
import { ExecutiveCommentsRequestBody } from 'modules/comments/types/executiveComment';
import { useAllSlates } from 'modules/executive/hooks/useAllSlates';
import { useHat } from 'modules/executive/hooks/useHat';
import { useMkrOnHat } from 'modules/executive/hooks/useMkrOnHat';
import { useSpellData } from 'modules/executive/hooks/useSpellData';
import { useVotedProposals } from 'modules/executive/hooks/useVotedProposals';
import { CMSProposal, Proposal } from 'modules/executive/types';
import { useLockedMkr } from 'modules/mkr/hooks/useLockedMkr';
import React, { useEffect, useState } from 'react';
import { Grid, Button, Flex, Close, Text, Box, Label, Checkbox } from 'theme-ui';
import { useChiefVote } from 'modules/executive/hooks/useChiefVote';
import { useDelegateVote } from 'modules/executive/hooks/useDelegateVote';
import { useVoteProxyVote } from 'modules/executive/hooks/useVoteProxyVote';
import { useAccount } from 'modules/app/hooks/useAccount';
import { formatValue } from 'lib/string';
import { BigNumber, utils } from 'ethers';
import { useActiveWeb3React } from 'modules/web3/hooks/useActiveWeb3React';
import { sign } from 'modules/web3/helpers/sign';

export default function DefaultVoteModalView({
  proposal,
  close,
  onTransactionPending,
  onTransactionMined,
  onTransactionCreated,
  onTransactionFailed
}: {
  proposal: Proposal;
  close: () => void;
  onTransactionPending: () => void;
  onTransactionMined: () => void;
  onTransactionFailed: () => void;
  onTransactionCreated: (txId: string) => void;
}): React.ReactElement {
  const { trackButtonClick } = useAnalytics(ANALYTICS_PAGES.EXECUTIVE);
  const bpi = useBreakpointIndex();

  const { account, voteProxyContractAddress, voteDelegateContractAddress } = useAccount();
  const { network, library } = useActiveWeb3React();
  const addressLockedMKR = voteDelegateContractAddress || voteProxyContractAddress || account;
  const { data: lockedMkr, mutate: mutateLockedMkr } = useLockedMkr(
    addressLockedMKR,
    voteProxyContractAddress,
    voteDelegateContractAddress
  );

  const { data: spellData, mutate: mutateSpellData } = useSpellData(proposal.address);

  // revalidate on mount
  useEffect(() => {
    mutateLockedMkr();
    mutateSpellData();
  }, []);

  const [hatChecked, setHatChecked] = useState(true);
  const { data: currentSlate, mutate: mutateVotedProposals } = useVotedProposals();
  const { mutate: mutateComments } = useExecutiveComments(proposal.address);

  const [comment, setComment] = useState('');
  const [signedMessage, setSignedMessage] = useState('');
  const [isFetchingNonce, setIsFetcingNonce] = useState(false);

  const signComment = async () => {
    try {
      setIsFetcingNonce(true);
      const data = await fetchJson('/api/comments/nonce', {
        method: 'POST',
        body: JSON.stringify({
          voterAddress: account
        })
      });
      setIsFetcingNonce(false);
      const signed = await sign(account as string, data.nonce, library);
      setSignedMessage(signed);
    } catch (e) {
      setIsFetcingNonce(false);
    }
  };

  const { data: allSlates } = useAllSlates();
  const { mutate: mutateMkrOnHat } = useMkrOnHat();

  const { data: hat } = useHat();

  const { vote: delegateVote } = useDelegateVote();
  const { vote: proxyVote } = useVoteProxyVote();
  const { vote: chiefVote } = useChiefVote();

  const isHat = hat && hat === proposal.address;
  const showHatCheckbox =
    hat && proposal.address !== hat && currentSlate.includes(hat) && !currentSlate.includes(proposal.address);
  const hasVotingWeight = lockedMkr?.gt(0);
  const mkrSupporting = spellData ? BigNumber.from(spellData.mkrSupport) : BigNumber.from(0);
  const afterVote =
    currentSlate && currentSlate.includes(proposal.address)
      ? mkrSupporting
      : lockedMkr && spellData
      ? lockedMkr.add(BigNumber.from(spellData.mkrSupport))
      : BigNumber.from(0);

  const vote = hatChecked => {
    const proposals =
      hatChecked && showHatCheckbox ? sortBytesArray([hat, proposal.address]) : [proposal.address];

    const encoder = new utils.AbiCoder();
    const encodedParam = encoder.encode(['address[]'], [proposals]);

    const slate = utils.keccak256('0x' + encodedParam.slice(-64 * proposals.length)) as any;
    const slateAlreadyExists = allSlates && allSlates.findIndex(l => l === slate) > -1;
    const slateOrProposals = slateAlreadyExists ? slate : proposals;

    const callbacks = {
      initialized: txId => onTransactionCreated(txId),
      pending: async txHash => {
        // if comment included, add to comments db
        if (comment.length > 0) {
          const requestBody: ExecutiveCommentsRequestBody = {
            voterAddress: account || '',
            delegateAddress: voteDelegateContractAddress ?? '',
            comment: comment,
            voteProxyAddress: voteProxyContractAddress ?? '',
            signedMessage: signedMessage,
            txHash
          };
          fetchJson(`/api/comments/executive/add/${proposal.address}?network=${network}`, {
            method: 'POST',
            body: JSON.stringify(requestBody)
          })
            .then(() => {
              // console.log('comment successfully added');
              mutateComments();
            })
            .catch(() => console.error('failed to add comment'));
        }
        onTransactionPending();
      },
      mined: () => {
        mutateVotedProposals();
        mutateMkrOnHat();
        onTransactionMined();
      },
      error: () => onTransactionFailed()
    };

    if (voteDelegateContractAddress) {
      delegateVote(slateOrProposals, callbacks);
    } else if (voteProxyContractAddress) {
      proxyVote(slateOrProposals, callbacks);
    } else {
      chiefVote(slateOrProposals, callbacks);
    }
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
              {formatValue(lockedMkr)} MKR
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
              {formatValue(mkrSupporting)} MKR
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
              {formatValue(afterVote)} MKR
            </Text>
          ) : (
            <Box sx={{ mt: [0, 2] }}>
              <SkeletonThemed />
            </Box>
          )}
        </Box>
      </Grid>
      <Box sx={{ width: '100%', my: 3 }}>
        <CommentTextBox
          onChange={(val: string) => {
            setComment(val);
            setSignedMessage('');
          }}
          value={comment}
        />
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
              disabled={
                comment.length > 250 || !hasVotingWeight || signedMessage.length > 0 || isFetchingNonce
              }
              sx={{ width: '100%' }}
            >
              {!isFetchingNonce ? '1 - Sign your comment' : 'Loading...'}
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
