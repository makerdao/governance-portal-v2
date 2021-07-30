/** @jsx jsx */
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
  Link as ExternalLink,
  jsx
} from 'theme-ui';
import { useBreakpointIndex } from '@theme-ui/match-media';
import Head from 'next/head';
import shallow from 'zustand/shallow';
import { DialogOverlay, DialogContent } from '@reach/dialog';
import getMaker from 'lib/maker';
import { fadeIn, slideUp } from 'lib/keyframes';
import { getEtherscanLink } from 'lib/utils';
import { getNetwork } from 'lib/maker';
import useAccountsStore from 'stores/accounts';
import useTransactionStore, { transactionsSelectors, transactionsApi } from 'stores/transactions';
import { useLockedMkr } from 'lib/hooks';
import PrimaryLayout from 'components/layouts/Primary';
import SidebarLayout from 'components/layouts/Sidebar';
import Stack from 'components/layouts/Stack';
import SystemStatsSidebar from 'components/SystemStatsSidebar';
import ResourceBox from 'components/ResourceBox';
import { TxDisplay } from 'components/delegations';
import Withdraw from 'components/executive/Withdraw';

const AccountPage = (): JSX.Element => {
  const bpi = useBreakpointIndex();
  const account = useAccountsStore(state => state.currentAccount);
  const address = account?.address;
  const [voteDelegate, setVoteDelegate, voteProxy] = useAccountsStore(state =>
    account
      ? [state.voteDelegate, state.setVoteDelegate, state.proxies[account.address]]
      : [null, state.setVoteDelegate, null]
  );
  const [txId, setTxId] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [warningRead, setWarningRead] = useState(false);
  const { data: chiefBalance } = useLockedMkr(address, voteProxy);
  const { data: delegatedMkr } = useLockedMkr(voteDelegate ? voteDelegate.getVoteDelegateAddress() : null);

  const [track, tx] = useTransactionStore(
    state => [state.track, txId ? transactionsSelectors.getTransaction(state, txId) : null],
    shallow
  );

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
      <Head>
        <title>Maker Governance - Account</title>
      </Head>

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
              {voteDelegate && !modalOpen ? (
                <Box>
                  <Text>Your delegate contract address:</Text>
                  <ExternalLink
                    title="View on etherescan"
                    href={getEtherscanLink(getNetwork(), voteDelegate.getVoteDelegateAddress(), 'address')}
                    target="_blank"
                  >
                    <Text as="p">{voteDelegate.getVoteDelegateAddress()}</Text>
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
                      onDismiss={() => setModalOpen(false)}
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
                        <TxDisplay tx={tx} setTxId={setTxId} onDismiss={() => setModalOpen(false)} />
                      </DialogContent>
                    </DialogOverlay>
                  )}
                  <Alert variant="notice" sx={{ mt: 3, flexDirection: 'column', alignItems: 'flex-start' }}>
                    Warning: You will be unable to vote with a vote proxy contract or your existing chief
                    balance through the UI after creating a delegate contract. This functionality is only
                    affected in the user interface and not at the contract level. Future updates will address
                    this issue soon.
                  </Alert>
                  <Label sx={{ mt: 2, fontSize: 2, alignItems: 'center' }}>
                    <Checkbox checked={warningRead} onClick={event => setWarningRead(!warningRead)} /> I
                    understand
                  </Label>
                  <Button
                    disabled={!warningRead}
                    onClick={onCreateDelegate}
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
                      {voteDelegate
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
          <ResourceBox />
        </Stack>
      </SidebarLayout>
    </PrimaryLayout>
  );
};

export default AccountPage;
