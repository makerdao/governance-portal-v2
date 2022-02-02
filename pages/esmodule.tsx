import { Flex, Box, Button, Text, Card, Link } from 'theme-ui';
import { useState, useRef } from 'react';
import { DialogOverlay, DialogContent } from '@reach/dialog';
import { useBreakpointIndex } from '@theme-ui/match-media';
import { BigNumber as BigNumberJS } from 'bignumber.js';
import { BigNumber } from 'ethers';
import { formatValue } from 'lib/string';
import { formatDateWithTime } from 'lib/datetime';

import PrimaryLayout from 'modules/app/components/layout/layouts/Primary';
import BurnModal from 'modules/esm/components/BurnModal';
import ShutdownModal from 'modules/esm/components/ShutdownModal';
import ProgressRing from 'modules/esm/components/ProgressRing';
import ESMHistory from 'modules/esm/components/ESMHistory';
import { useEsmTotalStaked } from 'modules/esm/hooks/useEsmTotalStaked';
import { useEsmIsActive } from 'modules/esm/hooks/useEsmIsActive';
import { HeadComponent } from 'modules/app/components/layout/Head';
import { useAllEsmJoins } from 'modules/gql/hooks/useAllEsmJoins';
import { useEsmThreshold } from 'modules/esm/hooks/useEsmThreshold';
import { useAccount } from 'modules/app/hooks/useAccount';
import { useMkrInEsmByAddress } from 'modules/esm/hooks/useMkrInEsm';
import { useCageTime } from 'modules/esm/hooks/useCageTime';
import { useLockedMkr } from 'modules/mkr/hooks/useLockedMkr';

const ESModule = (): React.ReactElement => {
  const loader = useRef<HTMLDivElement>(null);
  const { account } = useAccount();
  const [showDialog, setShowDialog] = useState(false);
  const bpi = useBreakpointIndex();

  const { data: allEsmJoins } = useAllEsmJoins();
  const { data: totalStaked, mutate: mutateTotalStaked } = useEsmTotalStaked();
  const { data: thresholdAmount } = useEsmThreshold();
  const { data: esmIsActive } = useEsmIsActive();
  const { data: mkrInEsmByAddress, mutate: mutateMkrInEsmByAddress } = useMkrInEsmByAddress(account);
  const { data: cageTime } = useCageTime();
  const { data: lockedInChief } = useLockedMkr(account);

  const esmThresholdMet = !!totalStaked && !!thresholdAmount && totalStaked.gte(thresholdAmount);

  const DesktopView = () => {
    return (
      <>
        <Flex sx={{ flexDirection: 'row' }}>
          <Text data-testid="total-mkr-esmodule-staked">
            {totalStaked ? (
              `${formatValue(totalStaked, 'wad', 6)}`
            ) : (
              <Box pl="14px" pr="14px">
                <div ref={loader} />
              </Box>
            )}
          </Text>
          {thresholdAmount && (
            <Text color="#708390" sx={{ fontWeight: '400' }}>
              &nbsp;of {thresholdAmount ? `${formatValue(thresholdAmount, 'wad', 0)} MKR` : '---'}
            </Text>
          )}
        </Flex>
        <Box
          sx={{
            borderRadius: 'medium',
            minHeight: 20,
            backgroundColor: 'muted',
            height: '20px',
            my: 3
          }}
          data-testid="progress-bar"
        >
          {thresholdAmount && (
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
                      esmThresholdMet
                        ? '100'
                        : formatValue(totalStaked.mul(100).div(thresholdAmount), 'wad', 0)
                    }%`
                  : '0%'
              }}
            />
          )}
        </Box>
      </>
    );
  };

  const MobileView = () => {
    return (
      <>
        <ProgressRing
          progress={
            esmThresholdMet
              ? esmIsActive
                ? 100
                : new BigNumberJS(formatValue(totalStaked.mul(100).div(thresholdAmount), 'wad', 0)).toNumber()
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
      <HeadComponent title="Emergency Shutdown Module" />

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
                  variant: 'dialog.desktop',
                  boxShadow: '0px 10px 50px hsla(0, 0%, 0%, 0.33)',
                  borderRadius: '8px',
                  px: 5,
                  py: 4,
                  my: 5
                }
          }
        >
          {totalStaked ? (
            !esmThresholdMet ? (
              <BurnModal
                setShowDialog={setShowDialog}
                lockedInChief={lockedInChief || BigNumber.from(0)}
                totalStaked={totalStaked}
                mutateTotalStaked={mutateTotalStaked}
                mutateMkrInEsmByAddress={mutateMkrInEsmByAddress}
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
            my: 3
          }}
        >
          <Text sx={{ textAlign: 'center' }}>
            Emergency shutdown has been initiated on {formatDateWithTime(cageTime.toNumber())}. This dashboard
            is currently read-only. You can read more information about next steps{' '}
            <Link href="https://makerdao.world/en/learn/governance/emergency-shutdown" target="_blank">
              here
            </Link>
            .
          </Text>
        </Flex>
      )}
      <Box>
        <Text variant="heading">Emergency Shutdown Module</Text>
      </Box>
      <Box mt={2}>
        <Text variant="text" sx={{ color: 'onSecondary' }}>
          The ESM allows MKR holders to shutdown the system without a central authority. Once{' '}
          {thresholdAmount ? `${formatValue(thresholdAmount, 'wad', 0)}` : '---'} MKR are entered into the
          ESM, emergency shutdown can be executed.{' '}
          <Link
            href="https://docs.makerdao.com/smart-contract-modules/emergency-shutdown-module"
            target="_blank"
          >
            Read the documentation here.
          </Link>
        </Text>
      </Box>
      <Box sx={{ mt: 4 }}>
        <Text variant="microHeading">Total MKR Burned</Text>
      </Box>
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
            <Box p={2}>
              <Text color="#9FAFB9" sx={{ fontWeight: '300', alignSelf: 'center' }}>
                No Account Connected
              </Text>
            </Box>
          )}
          {totalStaked && account ? (
            <Button
              onClick={() => setShowDialog(true)}
              variant="outline"
              sx={{ color: 'onNotice', borderColor: 'notice', borderRadius: 'small' }}
            >
              {esmThresholdMet ? 'Initiate Emergency Shutdown' : 'Burn Your MKR'}
            </Button>
          ) : null}
          <Box p={2}>
            <Text color="#9FAFB9" sx={{ fontWeight: '300', alignSelf: 'center' }}>
              {mkrInEsmByAddress && mkrInEsmByAddress.gt(0) ? (
                <Box>
                  You burned{' '}
                  <strong style={{ fontWeight: 'bold' }}>{formatValue(mkrInEsmByAddress, 'wad', 6)}</strong>{' '}
                  in the ESM
                </Box>
              ) : (
                'You have no MKR in the ESM'
              )}
            </Text>
          </Box>
        </Flex>
      </Card>
      <Box mt={5}>
        <Text variant="microHeading">ESM History</Text>
      </Box>
      <ESMHistory allEsmJoins={allEsmJoins} />
    </PrimaryLayout>
  );
};

export default function ESModulePage(): JSX.Element {
  return <ESModule />;
}
