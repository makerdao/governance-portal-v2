/** @jsx jsx */
import { Flex, Box, Button, Text, Card, Link, jsx } from 'theme-ui';
import { useState, useRef } from 'react';
import useSWR, { mutate } from 'swr';
import { DialogOverlay, DialogContent } from '@reach/dialog';
import { useBreakpointIndex } from '@theme-ui/match-media';
import getMaker from '../lib/maker';
import PrimaryLayout from '../components/layouts/Primary';
import BurnModal from '../components/es/BurnModal';
import ShutdownModal from '../components/es/ShutdownModal';
import ProgressRing from '../components/es/ProgressRing';
import ESMHistory from '../components/es/ESMHistory';
import useAccountsStore from '../stores/accounts';
import { formatDateWithTime } from '../lib/utils';

async function getModuleStats() {
  const maker = await getMaker();
  const esmService = await maker.service('esm');
  let address;
  try {
    address = maker.currentAddress();
  } catch (e) {
    address = null;
  }
  return Promise.all([
    esmService.getTotalStaked(),
    esmService.canFire(),
    esmService.thresholdAmount(),
    address ? esmService.getTotalStakedByAddress(address) : null,
    maker.service('smartContract').getContract('END').when(),
    address ? maker.service('chief').getNumDeposits(address) : null,
    maker.service('esm').getStakingHistory()
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
  const [totalStaked, canFire, thresholdAmount, mkrInEsm, cageTime, lockedInChief, stakingHistory] =
    data || [];
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
              `${totalStaked.toString(6)}`
            ) : (
              <Box pl="14px" pr="14px">
                <div ref={loader} />
              </Box>
            )}
          </Text>
          <Text color="#708390" sx={{ fontWeight: '400' }}>
            &nbsp;of {thresholdAmount ? thresholdAmount.toString() : '---'}
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
          data-testid="progress-bar"
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
              ? canFire
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
          {totalStaked ? (
            canFire ? (
              <BurnModal
                setShowDialog={setShowDialog}
                lockedInChief={lockedInChief ? lockedInChief.toNumber() : 0}
                totalStaked={totalStaked}
              />
            ) : (
              <ShutdownModal setShowDialog={setShowDialog} thresholdAmount={thresholdAmount} />
            )
          ) : (
            <Box pl="14px" pr="14px">
              <div ref={loader} />
            </Box>
          )}
        </DialogContent>
      </DialogOverlay>
      {cageTime && cageTime.gt(0) && (
        <Flex
          sx={{
            flexDirection: 'column',
            width: '100%',
            justifyContent: 'center',
            alignItems: 'center',
            border: '1px solid #F77249',
            borderRadius: 'medium',
            backgroundColor: '#FDEDE8',
            color: '#994126',
            p: 3,
            fontSize: 1,
            mt: 3
          }}
        >
          <Text sx={{ textAlign: 'center' }}>
            Emergency shutdown has been initiated on {formatDateWithTime(cageTime)}. This dashboard is
            currently read-only. You can read more information about next steps here NEED LINK
          </Text>
        </Flex>
      )}
      <Text variant="heading">Emergency Shutdown Module</Text>
      <Text variant="text" sx={{ mt: 2, color: 'onSecondary' }}>
        The ESM allows MKR holders to shutdown the system without a central authority. Once{' '}
        {thresholdAmount ? thresholdAmount.toBigNumber().toFormat() : '---'} MKR are entered into the ESM,
        emergency shutdown can be executed.{' '}
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
            alignItems: 'center',
            mt: bpi < 1 ? 2 : undefined
          }}
        >
          {!account && (
            <Text color="#9FAFB9" sx={{ fontWeight: '300', alignSelf: 'center', p: 2 }}>
              No Account Connected
            </Text>
          )}
          {totalStaked && account ? (
            <Button
              onClick={() => setShowDialog(true)}
              variant="outline"
              sx={{ color: 'onNotice', borderColor: 'notice', borderRadius: 'small' }}
            >
              {totalStaked.gte(thresholdAmount) ? 'Initiate Emergency Shutdown' : 'Burn Your MKR'}
            </Button>
          ) : null}
          <Text color="#9FAFB9" sx={{ fontWeight: '300', alignSelf: 'center', p: 2 }}>
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
      <ESMHistory stakingHistory={stakingHistory} />
    </PrimaryLayout>
  );
};

export default function ESModulePage(): JSX.Element {
  return <ESModule />;
}
