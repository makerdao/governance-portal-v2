/*

SPDX-FileCopyrightText: © 2023 Dai Foundation <www.daifoundation.org>

SPDX-License-Identifier: AGPL-3.0-or-later

*/

import { useState } from 'react';
import { Alert, Box, Button, Card, Checkbox, Flex, Heading, Label, Text } from 'theme-ui';
import { formatValue } from 'lib/string';
import { useLockedMkr } from 'modules/mkr/hooks/useLockedSky';
import PrimaryLayout from 'modules/app/components/layout/layouts/Primary';
import SidebarLayout from 'modules/app/components/layout/layouts/Sidebar';
import Stack from 'modules/app/components/layout/layouts/Stack';
import SystemStatsSidebar from 'modules/app/components/SystemStatsSidebar';
import ResourceBox from 'modules/app/components/ResourceBox';
import { DelegateDetail, TxDisplay } from 'modules/delegates/components';
import Withdraw from 'modules/mkr/components/Withdraw';
import Icon from 'modules/app/components/Icon';
import { HeadComponent } from 'modules/app/components/layout/Head';
import { useAccount } from 'modules/app/hooks/useAccount';
import { AddressDetail } from 'modules/address/components/AddressDetail';
import ManageDelegation from 'modules/delegates/components/ManageDelegation';
import { useDelegateCreate } from 'modules/delegates/hooks/useDelegateCreate';
import SkeletonThemed from 'modules/app/components/SkeletonThemed';
import { ErrorBoundary } from 'modules/app/components/ErrorBoundary';
import { useAddressInfo } from 'modules/app/hooks/useAddressInfo';
import { ExternalLink } from 'modules/app/components/ExternalLink';
import AccountSelect from 'modules/app/components/layout/header/AccountSelect';
import { ClientRenderOnly } from 'modules/app/components/ClientRenderOnly';
import EtherscanLink from 'modules/web3/components/EtherscanLink';
import { DialogContent, DialogOverlay } from 'modules/app/components/Dialog';
import { useNetwork } from 'modules/app/hooks/useNetwork';
import { TxStatus } from 'modules/web3/constants/transaction';
import { useDelegateVote } from 'modules/executive/hooks/useDelegateVote';
import { ZERO_ADDRESS } from 'modules/web3/constants/addresses';
import { useVotedProposals } from 'modules/executive/hooks/useVotedProposals';
import { useReadContract } from 'wagmi';
import { chiefAddress, newChiefAbi } from 'modules/contracts/generated';
import { networkNameToChainId } from 'modules/web3/helpers/chain';

enum DelegateFlow {
  CREATE = 'CREATE_DELEGATE',
  VOTE = 'VOTE'
}

const AccountPage = (): React.ReactElement => {
  const network = useNetwork();
  const chainId = networkNameToChainId(network);
  const { account, mutate: mutateAccount, voteDelegateContractAddress, votingAccount } = useAccount();

  const { data: addressInfo, error: errorLoadingAddressInfo } = useAddressInfo(votingAccount, network);
  const { data: chiefBalance } = useLockedMkr(account);

  const [modalOpen, setModalOpen] = useState(false);
  const [warningRead, setWarningRead] = useState(false);
  const [txStatus, setTxStatus] = useState<TxStatus>(TxStatus.IDLE);
  const [txHash, setTxHash] = useState<`0x${string}` | undefined>();
  const [flow, setFlow] = useState<DelegateFlow>(DelegateFlow.CREATE);

  const { data: live } = useReadContract({
    address: chiefAddress[chainId],
    abi: newChiefAbi,
    chainId,
    functionName: 'live',
    scopeKey: `chief-live-${chainId}`
  });
  const isChiefLive = live === 1n;

  const { data: votedProposals, mutate: mutateVotedProposals } =
    useVotedProposals(voteDelegateContractAddress);
  const votedForAddressZero = votedProposals.includes(ZERO_ADDRESS);

  const createDelegate = useDelegateCreate({
    onStart: (hash: `0x${string}`) => {
      setTxHash(hash);
      setTxStatus(TxStatus.LOADING);
    },
    onSuccess: (hash: `0x${string}`) => {
      setTxHash(hash);
      setTxStatus(TxStatus.SUCCESS);
      mutateAccount?.();
    },
    onError: () => {
      setTxStatus(TxStatus.ERROR);
    }
  });

  const addressZeroVote = useDelegateVote({
    slateOrProposals: [ZERO_ADDRESS],
    onStart: (hash: `0x${string}`) => {
      setTxHash(hash);
      setTxStatus(TxStatus.LOADING);
    },
    onSuccess: (hash: `0x${string}`) => {
      setTxHash(hash);
      setTxStatus(TxStatus.SUCCESS);
      mutateVotedProposals();
    },
    onError: () => {
      setTxStatus(TxStatus.ERROR);
    },
    enabled: !!voteDelegateContractAddress && !votedForAddressZero && !isChiefLive
  });

  return (
    <PrimaryLayout sx={{ maxWidth: [null, null, null, 'page', 'dashboard'] }}>
      <HeadComponent title="Account" />

      <SidebarLayout>
        <Box sx={{ mb: 6 }}>
          <Box sx={{ my: 3 }}>
            <Heading as="h3" variant="microHeading">
              Account Information
            </Heading>
          </Box>
          <Box>
            {addressInfo && (
              <Box>
                {addressInfo.delegateInfo && (
                  <Box>
                    <DelegateDetail delegate={addressInfo.delegateInfo} />
                  </Box>
                )}
                {!addressInfo.delegateInfo && <AddressDetail addressInfo={addressInfo} />}
              </Box>
            )}
            {account && !addressInfo && !errorLoadingAddressInfo && (
              <Box sx={{ my: 3 }}>
                <SkeletonThemed height={100} width="100%" />
              </Box>
            )}
            {errorLoadingAddressInfo && <Text>Error loading address information</Text>}
          </Box>
          {!account ? (
            <Box>
              <ClientRenderOnly>
                <AccountSelect />
              </ClientRenderOnly>
            </Box>
          ) : (
            <Box sx={{ mt: 4 }}>
              <Box sx={{ my: 3 }}>
                <Heading as="h3" variant="microHeading">
                  Vote Delegation
                </Heading>
              </Box>
              <Card>
                {voteDelegateContractAddress && !modalOpen && (
                  <Box sx={{ mb: 2 }}>
                    <Label>Your delegate contract address:</Label>

                    <EtherscanLink
                      type="address"
                      showAddress
                      hash={voteDelegateContractAddress}
                      network={network}
                    />
                  </Box>
                )}
                {voteDelegateContractAddress && !modalOpen && (
                  <Box sx={{ mb: 2 }}>
                    <Label>FAQ</Label>
                    <ExternalLink
                      title="How can I verify my delegate contract?"
                      href={
                        'https://dux.makerdao.network/Verifying-a-delegate-contract-on-Etherscan-df677c604ac94911ae071fedc6a98ed2'
                      }
                    >
                      <Text as="p" sx={{ display: 'flex', alignItems: 'center' }}>
                        How can I verify my delegate contract?{' '}
                        <Icon name="arrowTopRight" sx={{ size: 2, ml: 2 }} />
                      </Text>
                    </ExternalLink>
                  </Box>
                )}
                <DialogOverlay
                  isOpen={modalOpen}
                  onDismiss={() => {
                    setModalOpen(false);
                  }}
                >
                  <DialogContent ariaLabel="Delegate modal" widthDesktop="580px">
                    <TxDisplay
                      txStatus={txStatus}
                      setTxStatus={setTxStatus}
                      txHash={txHash}
                      setTxHash={setTxHash}
                      onDismiss={() => {
                        setModalOpen(false);
                      }}
                      description={
                        flow === DelegateFlow.CREATE
                          ? 'You have successfully created your delegate contract.'
                          : 'You have successfully voted for address(0). Thank you for contributing to the launch of SKY governance.'
                      }
                    >
                      {flow === DelegateFlow.CREATE && !isChiefLive && (
                        <Box>
                          <Text as="p" sx={{ mt: 4 }}>
                            You can now proceed to support the launch of SKY governance, or skip this step and
                            vote later
                          </Text>
                          <Text as="p" sx={{ mt: 3 }}>
                            Voting for address(0) now, even with 0 SKY delegated, ensures that any future
                            delegation to your delegate contract will immediately count toward launching the
                            new chief.
                          </Text>
                          <Button
                            disabled={
                              addressZeroVote.isLoading ||
                              !addressZeroVote.prepared ||
                              votedForAddressZero ||
                              isChiefLive
                            }
                            onClick={() => {
                              setFlow(DelegateFlow.VOTE);
                              setTxStatus(TxStatus.INITIALIZED);
                              addressZeroVote.execute();
                            }}
                            sx={{ mt: 3, mb: 1 }}
                            data-testid="vote-button"
                          >
                            Support address(0)
                          </Button>
                        </Box>
                      )}
                    </TxDisplay>
                  </DialogContent>
                </DialogOverlay>
                {!voteDelegateContractAddress && (
                  <Box>
                    <Label>No vote delegate contract detected</Label>
                    <Alert variant="notice" sx={{ mt: 2, flexDirection: 'column', alignItems: 'flex-start' }}>
                      Warning: You will be unable to vote with your existing chief balance through the UI
                      after creating a delegate contract. This functionality is only affected in the user
                      interface and not at the contract level.
                    </Alert>
                    <Label
                      sx={{ mt: 3, fontSize: 2, alignItems: 'center' }}
                      data-testid="checkbox-create-delegate"
                    >
                      <Checkbox
                        checked={warningRead}
                        onChange={() => {
                          setWarningRead(!warningRead);
                        }}
                      />
                      I understand
                    </Label>
                    <Button
                      disabled={!warningRead || createDelegate.isLoading || !createDelegate.prepared}
                      onClick={() => {
                        setTxStatus(TxStatus.INITIALIZED);
                        setModalOpen(true);
                        createDelegate.execute();
                      }}
                      sx={{ mt: 3, mb: 1 }}
                      data-testid="create-button"
                    >
                      Create delegate contract
                    </Button>
                  </Box>
                )}
                {!!voteDelegateContractAddress && !isChiefLive && (
                  <Box>
                    <Label>Support the Launch of SKY Governance</Label>
                    <Alert variant="notice" sx={{ mt: 2, flexDirection: 'column', alignItems: 'flex-start' }}>
                      Voting for address(0) now, even with 0 SKY delegated, ensures that any future delegation
                      to your delegate contract will immediately count toward launching the new chief.
                    </Alert>
                    <Button
                      disabled={
                        addressZeroVote.isLoading ||
                        !addressZeroVote.prepared ||
                        votedForAddressZero ||
                        isChiefLive
                      }
                      onClick={() => {
                        setFlow(DelegateFlow.VOTE);
                        setTxStatus(TxStatus.INITIALIZED);
                        setModalOpen(true);
                        addressZeroVote.execute();
                      }}
                      sx={{ mt: 3, mb: 1 }}
                      data-testid="vote-button"
                    >
                      Support address(0)
                    </Button>
                    {votedForAddressZero && (
                      <Text as="p" sx={{ mt: 2 }}>
                        You are supporting address(0). Thank you for contributing to the launch of SKY
                        governance.
                      </Text>
                    )}
                  </Box>
                )}
                {chiefBalance && chiefBalance > 0n && (
                  <Flex sx={{ alignItems: 'flex-start', flexDirection: 'column', mt: 5 }}>
                    <Text as="p">
                      You have a DSChief balance of{' '}
                      <Text sx={{ fontWeight: 'bold' }}>{formatValue(chiefBalance, 'wad', 6)} SKY.</Text>
                      <Text as="p" sx={{ my: 2 }}>
                        {voteDelegateContractAddress
                          ? 'As a delegate you can only vote with your delegate contract through the portal. You can withdraw your SKY and delegate it to yourself to vote with it.'
                          : 'If you become a delegate, you will only be able to vote through the portal as a delegate. In this case, it is recommended to withdraw your SKY and delegate it to yourself or create the delegate contract from a different account.'}
                      </Text>
                    </Text>
                    <Withdraw sx={{ mt: 3 }} />
                  </Flex>
                )}
              </Card>
            </Box>
          )}
        </Box>
        <Stack gap={3}>
          {addressInfo && addressInfo.delegateInfo && (
            <Box>
              <ErrorBoundary componentName="Delegate MKR">
                <ManageDelegation
                  delegate={addressInfo.delegateInfo}
                  textDelegate="Delegate SKY to myself"
                  textUndelegate="Undelegate SKY from my contract"
                />
              </ErrorBoundary>
            </Box>
          )}
          <ErrorBoundary componentName="System Info">
            <SystemStatsSidebar
              fields={[
                'mainnet polling contract',
                'arbitrum polling contract',
                'savings rate',
                'total dai',
                'debt ceiling',
                'system surplus'
              ]}
            />
          </ErrorBoundary>
          <ResourceBox type={'general'} />
        </Stack>
      </SidebarLayout>
    </PrimaryLayout>
  );
};

export default AccountPage;
