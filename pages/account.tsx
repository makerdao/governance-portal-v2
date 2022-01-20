import { useState } from 'react';
import {
  Alert,
  Box,
  Button,
  Card,
  Checkbox,
  Flex,
  Heading,
  Label,
  Text,
  Link as ExternalLink
} from 'theme-ui';
import { useBreakpointIndex } from '@theme-ui/match-media';
import shallow from 'zustand/shallow';
import { DialogOverlay, DialogContent } from '@reach/dialog';
import getMaker from 'lib/maker';
import { fadeIn, slideUp } from 'lib/keyframes';
import { getNetwork } from 'lib/maker';
import useAccountsStore from 'modules/app/stores/accounts';
import useTransactionStore, {
  transactionsSelectors,
  transactionsApi
} from 'modules/web3/stores/transactions';
import { cutMiddle } from 'lib/string';
import { useLockedMkr } from 'modules/mkr/hooks/useLockedMkr';
import { useAnalytics } from 'modules/app/client/analytics/useAnalytics';
import { ANALYTICS_PAGES } from 'modules/app/client/analytics/analytics.constants';
import PrimaryLayout from 'modules/app/components/layout/layouts/Primary';
import SidebarLayout from 'modules/app/components/layout/layouts/Sidebar';
import Stack from 'modules/app/components/layout/layouts/Stack';
import SystemStatsSidebar from 'modules/app/components/SystemStatsSidebar';
import ResourceBox from 'modules/app/components/ResourceBox';
import { TxDisplay } from 'modules/delegates/components';
import Withdraw from 'modules/mkr/components/Withdraw';
import { Icon } from '@makerdao/dai-ui-icons';
import { HeadComponent } from 'modules/app/components/layout/Head';
import { useVoteDelegateAddress } from 'modules/app/hooks/useVoteDelegateAddress';
import { getEtherscanLink } from 'modules/web3/helpers/getEtherscanLink';
import { useVoteProxyAddress } from 'modules/app/hooks/useVoteProxyAddress';

const AccountPage = (): JSX.Element => {
  const bpi = useBreakpointIndex();
  const account = useAccountsStore(state => state.currentAccount);
  const address = account?.address;
  const setVoteDelegate = useAccountsStore(state => state.setVoteDelegate);

  const { data: vpAddresses } = useVoteProxyAddress();
  const [txId, setTxId] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [warningRead, setWarningRead] = useState(false);
  const { data: voteDelegateAddress } = useVoteDelegateAddress();
  const { data: chiefBalance } = useLockedMkr(address, vpAddresses?.voteProxyAddress);
  const { data: delegatedMkr } = useLockedMkr(voteDelegateAddress ?? undefined);

  const [track, tx] = useTransactionStore(
    state => [state.track, txId ? transactionsSelectors.getTransaction(state, txId) : null],
    shallow
  );
  const { trackButtonClick } = useAnalytics(ANALYTICS_PAGES.ACCOUNT);

  const onCreateDelegate = async () => {
    const maker = await getMaker();
    const createTxCreator = () => maker.service('voteDelegateFactory').createDelegateContract();
    const txId = await track(createTxCreator, 'Create delegate contract', {
      mined: txId => {
        transactionsApi.getState().setMessage(txId, 'Delegate contract created');
        setVoteDelegate(maker.currentAccount().address);
      },
      error: () => {
        transactionsApi.getState().setMessage(txId, 'Delegate contract failed');
      }
    });
    setTxId(txId);
    setModalOpen(true);
  };

  return (
    <PrimaryLayout shortenFooter={true} sx={{ maxWidth: [null, null, null, 'page', 'dashboard'] }}>
      <HeadComponent title="Account" />

      <SidebarLayout>
        <Box>
          <Box sx={{ mt: 4, mb: 2 }}>
            <Heading as="h3" variant="microHeading">
              Account
            </Heading>
          </Box>
          {!address ? (
            <Text>Connect your wallet to view information about your account</Text>
          ) : (
            <Card>
              <Text as="p" variant="microHeading" sx={{ mb: 3 }}>
                Vote Delegation
              </Text>
              {voteDelegateAddress && !modalOpen ? (
                <Box>
                  <Text>Your delegate contract address:</Text>
                  <ExternalLink
                    title="View on etherescan"
                    href={getEtherscanLink(getNetwork(), voteDelegateAddress, 'address')}
                    target="_blank"
                  >
                    <Text as="p" data-testid="vote-delegate-address">
                      {bpi > 0 ? voteDelegateAddress : cutMiddle(voteDelegateAddress, 8, 8)}
                    </Text>
                  </ExternalLink>

                  <ExternalLink
                    title="How can I verify my delegate contract?"
                    href={
                      'https://dux.makerdao.network/Verifying-a-delegate-contract-on-Etherscan-df677c604ac94911ae071fedc6a98ed2'
                    }
                    target="_blank"
                  >
                    <Text as="p" sx={{ display: 'flex', mt: 2, alignItems: 'center' }}>
                      How can I verify my delegate contract? <Icon name="arrowTopRight" size={2} ml={2} />
                    </Text>
                  </ExternalLink>

                  {delegatedMkr && (
                    <>
                      <Text as="p" sx={{ mt: 3 }}>
                        Delegated MKR:
                      </Text>
                      <Text>{delegatedMkr.toBigNumber().toFormat(6)}</Text>
                    </>
                  )}
                </Box>
              ) : (
                <Box>
                  <Text as="p">No vote delegate contract detected</Text>
                  {tx && (
                    <DialogOverlay
                      style={{ background: 'hsla(237.4%, 13.8%, 32.7%, 0.9)' }}
                      isOpen={modalOpen}
                      onDismiss={() => {
                        setModalOpen(false);
                        trackButtonClick('closeCreateDelegateModal');
                      }}
                    >
                      <DialogContent
                        aria-label="Delegate modal"
                        sx={
                          bpi === 0
                            ? { variant: 'dialog.mobile', animation: `${slideUp} 350ms ease` }
                            : {
                                variant: 'dialog.desktop',
                                animation: `${fadeIn} 350ms ease`,
                                width: '580px',
                                px: 5,
                                py: 4
                              }
                        }
                      >
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
                  <Alert variant="notice" sx={{ mt: 3, flexDirection: 'column', alignItems: 'flex-start' }}>
                    Warning: You will be unable to vote with a vote proxy contract or your existing chief
                    balance through the UI after creating a delegate contract. This functionality is only
                    affected in the user interface and not at the contract level. Future updates will address
                    this issue soon.
                  </Alert>
                  <Label
                    sx={{ mt: 2, fontSize: 2, alignItems: 'center' }}
                    data-testid="checkbox-create-delegate"
                  >
                    <Checkbox
                      checked={warningRead}
                      onChange={() => {
                        setWarningRead(!warningRead);
                        trackButtonClick('setWarningRead');
                      }}
                    />{' '}
                    I understand
                  </Label>
                  <Button
                    disabled={!warningRead}
                    onClick={() => {
                      trackButtonClick('createDelegate');
                      onCreateDelegate();
                    }}
                    sx={{ mt: 3, mb: 1 }}
                    data-testid="create-button"
                  >
                    Create a delegate contract
                  </Button>
                </Box>
              )}
              {chiefBalance?.gt(0) && (
                <Flex sx={{ alignItems: 'flex-start', flexDirection: 'column', mt: 5 }}>
                  <Text as="p">
                    You have a DSChief balance of{' '}
                    <Text sx={{ fontWeight: 'bold' }}>{chiefBalance.toBigNumber().toFormat(6)} MKR.</Text>
                    <Text as="p" sx={{ my: 2 }}>
                      {voteDelegateAddress
                        ? 'As a delegate you can only vote with your delegate contract through the portal. You can withdraw your MKR and delegate it to yourself to vote with it.'
                        : 'If you become a delegate, you will only be able to vote through the portal as a delegate. In this case, it is recommended to withdraw your MKR and delegate it to yourself or create the delegate contract from a different account.'}
                    </Text>
                  </Text>
                  <Withdraw sx={{ mt: 3 }} />
                </Flex>
              )}
            </Card>
          )}
        </Box>
        <Stack gap={3}>
          <SystemStatsSidebar
            fields={['polling contract', 'savings rate', 'total dai', 'debt ceiling', 'system surplus']}
          />
          <ResourceBox type={'delegates'} />
          <ResourceBox type={'general'} />
        </Stack>
      </SidebarLayout>
    </PrimaryLayout>
  );
};

export default AccountPage;
