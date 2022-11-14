import { useState } from 'react';
import { Alert, Box, Button, Card, Checkbox, Flex, Heading, Label, Text } from 'theme-ui';
import { useBreakpointIndex } from '@theme-ui/match-media';
import { formatValue } from 'lib/string';
import { useLockedMkr } from 'modules/mkr/hooks/useLockedMkr';
import { useAnalytics } from 'modules/app/client/analytics/useAnalytics';
import { ANALYTICS_PAGES } from 'modules/app/client/analytics/analytics.constants';
import PrimaryLayout from 'modules/app/components/layout/layouts/Primary';
import SidebarLayout from 'modules/app/components/layout/layouts/Sidebar';
import Stack from 'modules/app/components/layout/layouts/Stack';
import SystemStatsSidebar from 'modules/app/components/SystemStatsSidebar';
import ResourceBox from 'modules/app/components/ResourceBox';
import { DelegateDetail, TxDisplay } from 'modules/delegates/components';
import Withdraw from 'modules/mkr/components/Withdraw';
import { Icon } from '@makerdao/dai-ui-icons';
import { HeadComponent } from 'modules/app/components/layout/Head';
import { useAccount } from 'modules/app/hooks/useAccount';
import { useWeb3 } from 'modules/web3/hooks/useWeb3';
import { AddressDetail } from 'modules/address/components/AddressDetail';
import ManageDelegation from 'modules/delegates/components/ManageDelegation';
import { useDelegateCreate } from 'modules/delegates/hooks/useDelegateCreate';
import SkeletonThemed from 'modules/app/components/SkeletonThemed';
import { ErrorBoundary } from 'modules/app/components/ErrorBoundary';
import { useAddressInfo } from 'modules/app/hooks/useAddressInfo';
import { useLinkedDelegateInfo } from 'modules/migration/hooks/useLinkedDelegateInfo';
import { useVoteDelegateAddress } from 'modules/delegates/hooks/useVoteDelegateAddress';
import { ExternalLink } from 'modules/app/components/ExternalLink';
import AccountSelect from 'modules/app/components/layout/header/AccountSelect';
import { ClientRenderOnly } from 'modules/app/components/ClientRenderOnly';
import EtherscanLink from 'modules/web3/components/EtherscanLink';
import { DialogContent, DialogOverlay } from 'modules/app/components/Dialog';

const AccountPage = (): React.ReactElement => {
  const bpi = useBreakpointIndex();
  const { network } = useWeb3();
  const {
    account,
    mutate: mutateAccount,
    voteDelegateContractAddress,
    voteProxyContractAddress,
    votingAccount
  } = useAccount();

  const { newOwnerConnected, newOwnerHasDelegateContract, previousOwnerAddress } = useLinkedDelegateInfo();
  const { data: addressInfo, error: errorLoadingAddressInfo } = useAddressInfo(votingAccount, network);
  const { data: previousOwnerContractAddress } = useVoteDelegateAddress(previousOwnerAddress);
  const { data: chiefBalance } = useLockedMkr(voteProxyContractAddress || account);

  const [modalOpen, setModalOpen] = useState(false);
  const [warningRead, setWarningRead] = useState(false);
  const { trackButtonClick } = useAnalytics(ANALYTICS_PAGES.ACCOUNT);

  const { create, tx, setTxId } = useDelegateCreate();

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
                {newOwnerConnected && previousOwnerContractAddress && (
                  <Box sx={{ mb: 2 }}>
                    <Label>Previous delegate contract address:</Label>

                    <EtherscanLink
                      type="address"
                      showAddress
                      hash={previousOwnerContractAddress}
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
                        How can I verify my delegate contract? <Icon name="arrowTopRight" size={2} ml={2} />
                      </Text>
                    </ExternalLink>
                  </Box>
                )}
                {!voteDelegateContractAddress && (
                  <Box>
                    <Label>
                      {newOwnerConnected && !newOwnerHasDelegateContract
                        ? 'Create a new delegate contract'
                        : 'No vote delegate contract detected'}
                    </Label>
                    {tx && (
                      <DialogOverlay
                        isOpen={modalOpen}
                        onDismiss={() => {
                          setModalOpen(false);
                          trackButtonClick('closeCreateDelegateModal');
                        }}
                      >
                        <DialogContent aria-label="Delegate modal" widthDesktop="580px">
                          <TxDisplay
                            tx={tx}
                            setTxId={setTxId}
                            onDismiss={() => {
                              setModalOpen(false);
                              trackButtonClick('closeCreateDelegateModal');
                            }}
                          />
                        </DialogContent>
                      </DialogOverlay>
                    )}
                    <Alert variant="notice" sx={{ mt: 2, flexDirection: 'column', alignItems: 'flex-start' }}>
                      Warning: You will be unable to vote with a vote proxy contract or your existing chief
                      balance through the UI after creating a delegate contract. This functionality is only
                      affected in the user interface and not at the contract level.
                    </Alert>
                    <Label
                      sx={{ mt: 3, fontSize: 2, alignItems: 'center' }}
                      data-testid="checkbox-create-delegate"
                    >
                      <Checkbox
                        checked={warningRead}
                        onChange={() => {
                          setWarningRead(!warningRead);
                          trackButtonClick('setWarningRead');
                        }}
                      />
                      I understand
                    </Label>
                    <Button
                      disabled={!warningRead}
                      onClick={() => {
                        trackButtonClick('createDelegate');
                        create({
                          initialized: () => setModalOpen(true),
                          mined: () => mutateAccount && mutateAccount()
                        });
                      }}
                      sx={{ mt: 3, mb: 1 }}
                      data-testid="create-button"
                    >
                      Create delegate contract
                    </Button>
                  </Box>
                )}
                {chiefBalance?.gt(0) && (
                  <Flex sx={{ alignItems: 'flex-start', flexDirection: 'column', mt: 5 }}>
                    <Text as="p">
                      You have a DSChief balance of{' '}
                      <Text sx={{ fontWeight: 'bold' }}>{formatValue(chiefBalance, 'wad', 6)} MKR.</Text>
                      <Text as="p" sx={{ my: 2 }}>
                        {voteDelegateContractAddress
                          ? 'As a delegate you can only vote with your delegate contract through the portal. You can withdraw your MKR and delegate it to yourself to vote with it.'
                          : 'If you become a delegate, you will only be able to vote through the portal as a delegate. In this case, it is recommended to withdraw your MKR and delegate it to yourself or create the delegate contract from a different account.'}
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
                  textDelegate="Delegate MKR to myself"
                  textUndelegate="Undelegate MKR from my contract"
                />
              </ErrorBoundary>
            </Box>
          )}
          <ErrorBoundary componentName="System Info">
            <SystemStatsSidebar
              fields={[
                'polling contract v2',
                'polling contract v1',
                'arbitrum polling contract',
                'savings rate',
                'total dai',
                'debt ceiling',
                'system surplus'
              ]}
            />
          </ErrorBoundary>
          <ResourceBox type={'delegates'} />
          <ResourceBox type={'general'} />
        </Stack>
      </SidebarLayout>
    </PrimaryLayout>
  );
};

export default AccountPage;
