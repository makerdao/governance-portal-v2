import { useBreakpointIndex } from '@theme-ui/match-media';
import { fetchJson } from 'lib/fetchJson';
import { sortBytesArray } from 'lib/utils';
import { ANALYTICS_PAGES } from 'modules/app/client/analytics/analytics.constants';
import { useAnalytics } from 'modules/app/client/analytics/useAnalytics';
import SkeletonThemed from 'modules/app/components/SkeletonThemed';
import CommentTextBox from 'modules/comments/components/CommentTextBox';
import { useExecutiveComments } from 'modules/comments/hooks/useExecutiveComments';
import { useAllSlates } from 'modules/executive/hooks/useAllSlates';
import { useHat } from 'modules/executive/hooks/useHat';
import { useMkrOnHat } from 'modules/executive/hooks/useMkrOnHat';
import { useSpellData } from 'modules/executive/hooks/useSpellData';
import { useVotedProposals } from 'modules/executive/hooks/useVotedProposals';
import { Proposal } from 'modules/executive/types';
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
import { ExecutiveCommentsRequestBody } from 'modules/comments/types/comments';
import { ExternalLink } from 'modules/app/components/ExternalLink';
import { getEtherscanLink } from 'modules/web3/helpers/getEtherscanLink';
import logger from 'lib/logger';
import { executiveSupportersCacheKey } from 'modules/cache/constants/cache-keys';

export default function DefaultVoteModalView({
  proposal,
  address,
  close,
  onTransactionPending,
  onTransactionMined,
  onTransactionCreated,
  onTransactionFailed
}: {
  proposal?: Proposal;
  address?: string;
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

  const spellAddress = proposal ? proposal.address : address ? address : '';

  const { data: spellData, mutate: mutateSpellData } = useSpellData(spellAddress);

  // revalidate on mount
  useEffect(() => {
    mutateLockedMkr();
    mutateSpellData();
  }, []);

  const [hatChecked, setHatChecked] = useState(true);
  const { data: currentSlate, mutate: mutateVotedProposals } = useVotedProposals();
  const { mutate: mutateComments } = useExecutiveComments(spellAddress);

  const [comment, setComment] = useState('');
  const [signedMessage, setSignedMessage] = useState('');
  const [isFetchingNonce, setIsFetcingNonce] = useState(false);

  const signComment = async () => {
    try {
      setIsFetcingNonce(true);
      const data = await fetchJson('/api/comments/nonce', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          address: account?.toLowerCase()
        })
      });
      setIsFetcingNonce(false);
      const signed = await sign(account?.toLowerCase() as string, data.nonce, library);
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

  const isHat = hat && hat === spellAddress;
  const showHatCheckbox =
    hat && spellAddress !== hat && currentSlate.includes(hat) && !currentSlate.includes(spellAddress);
  const hasVotingWeight = lockedMkr?.gt(0);
  const mkrSupporting = spellData ? BigNumber.from(spellData.mkrSupport) : BigNumber.from(0);
  const afterVote =
    currentSlate && currentSlate.includes(spellAddress)
      ? mkrSupporting
      : lockedMkr && spellData
      ? lockedMkr.add(BigNumber.from(spellData.mkrSupport))
      : BigNumber.from(0);

  const vote = hatChecked => {
    const proposals = hatChecked && showHatCheckbox ? sortBytesArray([hat, spellAddress]) : [spellAddress];

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
            voterAddress: addressLockedMKR || '',
            hotAddress: account || '',
            comment: comment,
            signedMessage: signedMessage,
            txHash,
            addressLockedMKR: addressLockedMKR || ''
          };
          fetchJson(`/api/comments/executive/add/${spellAddress}?network=${network}`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify(requestBody)
          })
            .then(() => {
              mutateComments();
            })
            .catch(() => logger.error('POST executive comments: failed to add comment'));
        }
        onTransactionPending();
      },
      mined: () => {
        mutateVotedProposals();
        mutateMkrOnHat();
        onTransactionMined();

        // Invalidate supporters cache
        setTimeout(() => {
          fetchJson(`/api/cache/invalidate?network=${network}`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              cacheKey: executiveSupportersCacheKey
            })
          });
        }, 30000);
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
    currentSlate && currentSlate.includes(spellAddress) && currentSlate.length > 1
      ? 'Concentrate all my MKR on this proposal'
      : currentSlate && !currentSlate.includes(spellAddress) && isHat
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
        <Text as="p" sx={{ fontSize: [3, 4], fontWeight: 'bold' }}>
          {proposal ? proposal.title : 'Unknown Spell'}
        </Text>
        <ExternalLink href={getEtherscanLink(network, spellAddress, 'address')} title="View on Etherscan">
          <Text as="p" sx={{ fontSize: [1, 4] }}>
            {spellAddress}
          </Text>
        </ExternalLink>
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
                comment.length > 1500 || !hasVotingWeight || signedMessage.length > 0 || isFetchingNonce
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
              data-testid="vote-modal-vote-btn"
              disabled={comment.length > 1500 || !hasVotingWeight || !signedMessage}
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
            data-testid="vote-modal-vote-btn"
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
