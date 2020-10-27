/** @jsx jsx */
import { Flex, Box, Button, Text, Card, Spinner, Link, jsx } from 'theme-ui';
import { useState, useRef } from 'react';
import { GetStaticProps } from 'next';
import useSWR, { mutate } from 'swr';
import ErrorPage from 'next/error';
import { DialogOverlay, DialogContent } from '@reach/dialog';
import { useBreakpointIndex } from '@theme-ui/match-media';
import getMaker, { isDefaultNetwork, MKR } from '../lib/maker';
import PrimaryLayout from '../components/layouts/Primary';
import BurnModal from '../components/es/BurnModal';
import ProgressRing from '../components/es/ProgressRing';
import ESMHistory from '../components/es/ESMHistory';
import useAccountsStore from '../stores/accounts';

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
    maker.service('smartContract').getContract('END').when(),
    maker.service('chief').getNumDeposits(account?.address)
  ]);
}

// if we are on the browser, trigger a prefetch as soon as possible
if (typeof window !== 'undefined') {
  getModuleStats().then(stats => {
    mutate('/es-module', stats, false);
  });
}

const ESModule = () => {
  const { data } = useSWR('/es-module', getModuleStats);
  const [totalStaked, canFire, thresholdAmount, fired, mkrInEsm, cageTime, lockedInChief] = data || [];
  const loader = useRef<HTMLDivElement>(null);
  const account = useAccountsStore(state => state.currentAccount);
  const [showDialog, setShowDialog] = useState(false);
  const bpi = useBreakpointIndex();

  const DesktopView = () => {
    return (
      <>
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
          sx={{
            borderRadius: 'medium',
            minHeight: 20,
            backgroundColor: '#F6F8F9',
            height: '20px',
            my: 3
          }}
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
      </>
    );
  };

  const MobileView = () => {
    return (
      <>
        <ProgressRing
          progress={
            typeof totalStaked !== 'undefined'
              ? totalStaked.gte(thresholdAmount)
                ? 100
                : totalStaked.mul(100).div(thresholdAmount).toFixed()
              : 0
          }
          totalStaked={totalStaked}
          thresholdAmount={thresholdAmount}
        />
      </>
    );
  };

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
                  borderRadius: '8px',
                  px: 5,
                  py: 4,
                  my: 5
                }
          }
        >
          <BurnModal
            address={account}
            setShowDialog={setShowDialog}
            bpi={bpi}
            lockedInChief={lockedInChief ? lockedInChief.toNumber() : 0}
            totalStaked={totalStaked}
          />
        </DialogContent>
      </DialogOverlay>
      <Text variant="heading">Emergency Shutdown Module</Text>
      <Text variant="text" sx={{ mt: 2, color: 'onSecondary' }}>
        The ESM allows MKR holders to shutdown the system without a central authority. Once 50,000 MKR are
        entered into the ESM, emergency shutdown can be executed.{' '}
        <Link
          href="https://docs.makerdao.com/smart-contract-modules/emergency-shutdown-module"
          target="_blank"
        >
          Read the documentation here.
        </Link>
      </Text>
      <Text variant="microHeading" sx={{ mt: 4 }}>
        Total MKR Burned
      </Text>
      <Card mt={3}>
        {bpi < 1 ? <MobileView /> : <DesktopView />}
        <Flex
          sx={{
            flexDirection: bpi > 0 ? 'row' : 'column',
            justifyContent: 'space-between',
            mt: bpi < 1 ? 2 : null
          }}
        >
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
          <Text color="#9FAFB9" sx={{ fontWeight: '300', alignSelf: 'center', p: 2, mt: bpi > 0 ? null : 2 }}>
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
      <ESMHistory />
    </PrimaryLayout>
  );
};

export default function ESModulePage(): JSX.Element {
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

// export const getStaticProps: GetStaticProps = async () => {
//   return {
//     unstable_revalidate: 30, // allow revalidation every 30 seconds
//     props: {}
//   };
// };
