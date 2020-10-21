/** @jsx jsx */
import { Flex, Box, Button, Text, Card, Spinner, Grid, Input, jsx } from 'theme-ui';
import { useState, useRef } from 'react';
import { GetStaticProps } from 'next';
import useSWR, { mutate } from 'swr';
import ErrorPage from 'next/error';
import { DialogOverlay, DialogContent } from '@reach/dialog';
import { useBreakpointIndex } from '@theme-ui/match-media';
import getMaker, { isDefaultNetwork, MKR } from '../lib/maker';
import PrimaryLayout from '../components/layouts/Primary';
import useAccountsStore from '../stores/accounts';
import Address from '../types/account'

async function getModuleStats() {
  const maker = await getMaker();
  const esmService = await maker.service('esm');
  let account;
  try {
    account = await maker.currentAddress();
  } catch (e) {
    account = { address: '0x0000000000000000000000000000000000000000' };
  }
  return Promise.all([
    esmService.getTotalStaked(),
    esmService.canFire(),
    esmService.thresholdAmount(),
    esmService.fired(),
    esmService.getTotalStakedByAddress(account.address),
    maker.service('smartContract').getContract('END').when()
  ]);
}

// if we are on the browser, trigger a prefetch as soon as possible
if (typeof window !== 'undefined') {
  getModuleStats().then(stats => {
    mutate('/es-module', stats, false);
  });
}

const ModalContent = ({ address, setShowDialog }: {address: Address | undefined, setShowDialog: (value: boolean) => void}) => {
  const [step, setStep] = useState(0);
  const { data: mkrBalance } = useSWR(['/user/mkr-balance', address], (_, address) =>
    getMaker().then(maker => maker.getToken(MKR).balanceOf(address))
  );
  const DefaultScreen = () => (
    <Flex sx={{ flexDirection: 'column', alignItems: 'center' }}>
      <Text variant="heading">Are you sure you want to burn MKR?</Text>
      <Text variant="text" sx={{ mt: 3, color: 'onSecondary' }}>
        By burning your MKR in the ESM, you are contributing to the shutdown of the Dai Credit System. Your
        MKR will be immediately burned and cannot be retrieved.
      </Text>
      <Grid columns={2} mt={4}>
        <Button
          onClick={() => setShowDialog(false)}
          variant="outline"
          sx={{ color: 'secondary', borderColor: 'secondary', borderRadius: 'small' }}
        >
          Cancel
        </Button>
        <Button
          onClick={() => setStep(1)}
          variant="outline"
          sx={{ color: 'onNotice', borderColor: 'notice', borderRadius: 'small' }}
        >
          Continue
        </Button>
      </Grid>
    </Flex>
  );
  const MKRAmount = () => (
    <Flex sx={{ flexDirection: 'column', alignItems: 'center' }}>
    <Text variant="heading">Burn your MKR in the ESM</Text>
    <Box sx={{ mt: 3, border: '1px solid #D5D9E0', borderRadius: 'small', px: 4, py: 4 }}>
      <Text variant='microHeading'>Enter the amount of MKR to burn</Text>
      <Input mt={3} placeholder='0.00 MKR'></Input>
  <Flex mt={3} ><Text variant='caps'>MKR Balance In Wallet</Text><Text variant='caps'>{mkrBalance}</Text></Flex>
    </Box>
    <Grid columns={2} mt={4}>
      <Button
        onClick={() => {setShowDialog(false)}}
        variant="outline"
        sx={{ color: 'secondary', borderColor: 'secondary', borderRadius: 'small' }}
      >
        Cancel
      </Button>
      <Button
        onClick={() => setStep(2)}
        variant="outline"
        sx={{ color: 'onNotice', borderColor: 'notice', borderRadius: 'small' }}
      >
        Continue
      </Button>
    </Grid>
  </Flex> 
  )
  switch (step) {
    case 0:
      return <DefaultScreen />;
    case 1:
      return <MKRAmount />
    default:
      return <DefaultScreen />;
  }
};

const ESModule = ({}) => {
  const { data } = useSWR('/es-module', getModuleStats);
  const [totalStaked, canFire, thresholdAmount, fired, mkrInEsm, cageTime] = data || [];
  const loader = useRef<HTMLDivElement>(null);
  const account = useAccountsStore(state => state.currentAccount);
  const [showDialog, setShowDialog] = useState(false);
  const bpi = useBreakpointIndex();
  return (
    <PrimaryLayout shortenFooter={true} sx={{ maxWidth: 'container' }}>
      <DialogOverlay
        style={{ background: 'hsla(237.4%, 13.8%, 32.7%, 0.9)' }}
        isOpen={showDialog}
        onDismiss={() => setShowDialog(false)}
      >
        <DialogContent
          aria-label="Executive Vote"
          sx={
            bpi === 0
              ? { variant: 'dialog.mobile' }
              : {
                  boxShadow: '0px 10px 50px hsla(0, 0%, 0%, 0.33)',
                  width: '520px',
                  borderRadius: '8px',
                  px: 5,
                  py: 4
                }
          }
        >
          {/* <ModalContent
            sx={{ px: [3, null] }}
            address={account?.address}
            voteProxy={voteProxy}
            close={() => setShowDialog(false)}
          /> */}
          <ModalContent address={account} setShowDialog={setShowDialog} />
        </DialogContent>
      </DialogOverlay>
      <Text variant="heading">Emergency Shutdown Module</Text>
      <Text variant="text" sx={{ mt: 2, color: 'onSecondary' }}>
        The ESM allows MKR holders to shutdown the system without a central authority. Once 50,000 MKR are
        entered into the ESM, emergency shutdown can be executed. Read the documentation here.
      </Text>
      <Text variant="microHeading" sx={{ mt: 4 }}>
        Total MKR Burned
      </Text>
      <Card mt={3}>
        <Flex sx={{ flexDirection: 'row' }}>
          <Text>
            {totalStaked ? (
              `${totalStaked.toString()}     `
            ) : (
              <Box pl="14px" pr="14px">
                <div ref={loader} />
              </Box>
            )}
          </Text>
          <Text color="#708390" ml="2" sx={{ fontWeight: '400' }}>
            {` of ${thresholdAmount ? thresholdAmount.toString() : '---'}`}
          </Text>
        </Flex>
        <Box
          sx={{ borderRadius: 'medium', minHeight: 20, backgroundColor: '#F6F8F9', height: '20px', my: 3 }}
        >
          <Box
            as="div"
            style={{
              borderRadius: 'inherit',
              height: '100%',
              transition: 'width 0.2s ease-in',
              backgroundColor: '#f75625',
              minHeight: '20px',
              width: totalStaked
                ? `${
                    totalStaked.gte(thresholdAmount)
                      ? '100'
                      : totalStaked.mul(100).div(thresholdAmount).toFixed()
                  }%`
                : '0%'
            }}
          />
        </Box>
        <Flex sx={{ flexDirection: 'row', justifyContent: 'space-between' }}>
          {totalStaked ? (
            <Button
              onClick={() => setShowDialog(true)}
              variant="outline"
              sx={{ color: 'onNotice', borderColor: 'notice', borderRadius: 'small' }}
            >
              Burn Your MKR
            </Button>
          ) : (
            <Box pl="14px" pr="14px">
              <Spinner size={'20px'} color="notice" />
            </Box>
          )}
          <Text color="#9FAFB9" sx={{ fontWeight: '300', alignSelf: 'center' }}>
            {mkrInEsm && mkrInEsm.gt(0) ? (
              <Box>
                You burned <strong style={{ fontWeight: 'bold' }}>{mkrInEsm.toString()}</strong> in the ESM
              </Box>
            ) : (
              'You have no MKR in the ESM'
            )}
          </Text>
        </Flex>
      </Card>
      <Text variant="microHeading" mt={5}>
        ESM History
      </Text>
      <Card mt={3}>
        <Text>No history to show</Text>
      </Card>
    </PrimaryLayout>
  );
};

export default function ESModulePage({}): JSX.Element {
  const [error, setError] = useState<string>();

  if (error) {
    return <ErrorPage statusCode={404} title="Error fetching ES module" />;
  }

  if (!isDefaultNetwork())
    return (
      <PrimaryLayout>
        <p>Loading…</p>
      </PrimaryLayout>
    );

  return <ESModule />;
}

export const getStaticProps: GetStaticProps = async () => {
  return {
    unstable_revalidate: 30, // allow revalidation every 30 seconds
    props: {}
  };
};
