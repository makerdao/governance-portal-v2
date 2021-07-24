/** @jsx jsx */
import { useState } from 'react';
import { Box, Button, Text, Link as ExternalLink, jsx } from 'theme-ui';
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
import PrimaryLayout from 'components/layouts/Primary';
import SidebarLayout from 'components/layouts/Sidebar';
import Stack from 'components/layouts/Stack';
import SystemStatsSidebar from 'components/SystemStatsSidebar';
import ResourceBox from 'components/ResourceBox';
import { TxDisplay } from 'components/delegations';
import Toggle from 'components/es/Toggle';

const CreateDelegate = (): JSX.Element => {
  const bpi = useBreakpointIndex();
  const [account, voteDelegate, setVoteDelegate, isActingAsDelegate, setIsActingAsDelegate] = useAccountsStore(state => [
    state.currentAccount,
    state.voteDelegate,
    state.setVoteDelegate,
    state.isActingAsDelegate,
    state.setIsActingAsDelegate
  ]);
  const address = account?.address;
  const [txId, setTxId] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);

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
        <title>Maker Governance - Delegates</title>
      </Head>

      <SidebarLayout>
        {!address ? (
          <Text>Connect your wallet to create a delegate contract</Text>
        ) : voteDelegate && !modalOpen ? (
          <Box>
            <Text>Your delegate contract address:</Text>
            <ExternalLink
              title="View on etherescan"
              href={getEtherscanLink(getNetwork(), voteDelegate.getVoteDelegateAddress(), 'address')}
              target="_blank"
            >
              <Text as="p">{voteDelegate.getVoteDelegateAddress()}</Text>
            </ExternalLink>

            <Box>
              { isActingAsDelegate ? 'You are acting as a delegate': 'You are not acting as a delegate' }
              <Box>
                <Toggle
                  active={isActingAsDelegate}
                  onClick={(newVal) => setIsActingAsDelegate(newVal)}
                  data-testid="allowance-toggle"
                />
              </Box>
            </Box>
          </Box>
        ) : (
          <Box>
            <Text as="h3" variant="smallHeading">
              Create a delegate contract
            </Text>
            <Text as="p" sx={{ mt: 3 }}>
              Use this page to create a delegate contract via the VoteDelegateFactory contract.
            </Text>
            <Text as="p" sx={{ mt: 3 }}>
              Once you become a delegate you will be available to choose between your delegate account and your normal account for voting using this page.
              Please remember that when accessing your account, if you have a delegate contract, your account will default to it. You will have to switch back to your vote proxy to operate with it.
            </Text>
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
            <Button onClick={onCreateDelegate} sx={{ mt: 3 }} data-testid="create-button">
              Create a delegate contract
            </Button>
          </Box>
        )}
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

export default CreateDelegate;
