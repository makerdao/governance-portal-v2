/*

SPDX-FileCopyrightText: © 2023 Dai Foundation <www.daifoundation.org>

SPDX-License-Identifier: AGPL-3.0-or-later

*/

import { Flex, Box, Button, Text, Card } from 'theme-ui';
import { useState, useRef } from 'react';
import { DialogOverlay, DialogContent } from 'modules/app/components/Dialog';
import { useBreakpointIndex } from '@theme-ui/match-media';
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
import { useAllEsmV2Joins } from 'modules/gql/hooks/useAllEsmV2Joins';
import { useEsmThreshold } from 'modules/esm/hooks/useEsmThreshold';
import { useAccount } from 'modules/app/hooks/useAccount';
import { useMkrInEsmByAddress } from 'modules/esm/hooks/useMkrInEsm';
import { useCageTime } from 'modules/esm/hooks/useCageTime';
import { useLockedMkr } from 'modules/mkr/hooks/useLockedMkr';
import { ErrorBoundary } from 'modules/app/components/ErrorBoundary';
import { ExternalLink } from 'modules/app/components/ExternalLink';
import { config } from 'lib/config';

const ESModule = (): React.ReactElement => {
  const loader = useRef<HTMLDivElement>(null);
  const { account } = useAccount();
  const [showDialog, setShowDialog] = useState(false);
  const bpi = useBreakpointIndex();

  const { data: allEsmJoins } = useAllEsmV2Joins();
  const { data: totalStaked, mutate: mutateTotalStaked } = useEsmTotalStaked();
  const { data: thresholdAmount } = useEsmThreshold();
  const { data: esmIsActive } = useEsmIsActive();
  const { data: mkrInEsmByAddress, mutate: mutateMkrInEsmByAddress } = useMkrInEsmByAddress(account);
  const { data: cageTime } = useCageTime();
  const { data: lockedInChief } = useLockedMkr(account);

  const esmThresholdMet = !!totalStaked && !!thresholdAmount && totalStaked >= thresholdAmount;

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
            backgroundColor: 'secondary',
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
                      esmThresholdMet ? '100' : formatValue((totalStaked * 100n) / thresholdAmount, 'wad', 0)
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
                : parseFloat(formatValue((totalStaked * 100n) / thresholdAmount, 'wad', 0))
              : 0
          }
          totalStaked={totalStaked}
          thresholdAmount={thresholdAmount}
        />
      </>
    );
  };

  return (
    <PrimaryLayout sx={{ maxWidth: 'container' }}>
      <HeadComponent title="Emergency Shutdown Module" />

      <DialogOverlay isOpen={showDialog} onDismiss={() => setShowDialog(false)}>
        <DialogContent ariaLabel="Executive Vote">
          {totalStaked ? (
            !esmThresholdMet ? (
              <BurnModal
                setShowDialog={setShowDialog}
                lockedInChief={lockedInChief || 0n}
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
      {cageTime && cageTime > 0n && (
        <Flex
          sx={{
            flexDirection: 'column',
            width: '100%',
            justifyContent: 'center',
            alignItems: 'center',
            border: '1px solid #F75524',
            borderRadius: 'medium',
            backgroundColor: '#FDEDE8',
            color: '#994126',
            p: 3,
            fontSize: 1,
            my: 3
          }}
        >
          <Text data-testid="es-initiated" sx={{ textAlign: 'center' }}>
            Emergency shutdown has been initiated on {formatDateWithTime(cageTime.toString())}. This dashboard
            is currently read-only. You can read more information about next steps{' '}
            <ExternalLink
              href="https://manual.makerdao.com/governance/emergency-shutdown"
              title="Learn about emergency shutdown"
            >
              <Text>here</Text>
            </ExternalLink>
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
          <ExternalLink
            href="https://docs.makerdao.com/smart-contract-modules/emergency-shutdown-module"
            title="View emergency shutdown docs"
          >
            <Text>Read the documentation here.</Text>
          </ExternalLink>
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
              disabled={config.READ_ONLY}
              variant="outline"
              sx={{ color: 'onNotice', borderColor: 'notice' }}
            >
              {esmThresholdMet ? 'Initiate Emergency Shutdown' : 'Burn Your MKR'}
            </Button>
          ) : null}
          <Box p={2}>
            <Text color="#9FAFB9" sx={{ fontWeight: '300', alignSelf: 'center' }}>
              {mkrInEsmByAddress && mkrInEsmByAddress > 0n ? (
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
      <ErrorBoundary componentName="ESM History">
        <ESMHistory allEsmJoins={allEsmJoins} />
      </ErrorBoundary>
    </PrimaryLayout>
  );
};

export default function ESModulePage(): JSX.Element {
  return (
    <ErrorBoundary componentName="ESM Page">
      <ESModule />
    </ErrorBoundary>
  );
}
