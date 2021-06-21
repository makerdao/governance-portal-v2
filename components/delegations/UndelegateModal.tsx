import { useState, useRef } from 'react';
import { Button, Flex, Text, Box } from 'theme-ui';
import { useBreakpointIndex } from '@theme-ui/match-media';
import { DialogOverlay, DialogContent } from '@reach/dialog';
import useSWR from 'swr';
import Skeleton from 'react-loading-skeleton';
import getMaker, { MKR } from '../../lib/maker';
import { fadeIn, slideUp } from '../../lib/keyframes';
import { changeInputValue } from '../../lib/utils';
import { Delegate } from '../../types/delegate';
import useAccountsStore from '../../stores/accounts';
import MKRInput from '../MKRInput';

type Props = {
  isOpen: boolean;
  onDismiss: (boolean) => void;
  delegate: Delegate;
};

export default function DelegateModal({ isOpen, onDismiss, delegate }: Props): JSX.Element {
  const account = useAccountsStore(state => state.currentAccount);
  const address = account?.address;
  const [mkrToDeposit, setMkrToDeposit] = useState(MKR(0));
  const bpi = useBreakpointIndex();
  const input = useRef<HTMLInputElement>(null);

  // TODO: update to delegate contract balance for this user
  const { data: mkrBalance } = useSWR(['/user/mkr-balance', address], (_, address) =>
    getMaker().then(maker => maker.getToken(MKR).balanceOf(address))
  );

  // TODO: add approval tx and state
  const approveIou = async () => {
    const maker = await getMaker();
    const tx = maker.getToken('IOU').approveUnlimited(delegate.address);
  };

  const freeMkr = async () => {
    const maker = await getMaker();
    // TODO: track this tx property in tx store
    const tx = await maker.service('voteDelegate').free(delegate.address, 0.1);
  };

  return (
    <>
      <DialogOverlay
        style={{ background: 'hsla(237.4%, 13.8%, 32.7%, 0.9)' }}
        isOpen={isOpen}
        onDismiss={onDismiss}
      >
        <DialogContent
          aria-label="Undelegate modal"
          sx={
            bpi === 0
              ? { variant: 'dialog.mobile', animation: `${slideUp} 350ms ease` }
              : {
                  variant: 'dialog.desktop',
                  animation: `${fadeIn} 350ms ease`,
                  width: '380px',
                  px: 5,
                  py: 4
                }
          }
        >
          <Flex sx={{ flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
            <Text variant="microHeading" sx={{ fontSize: [3, 6] }}>
              Withdraw from delegate contract
            </Text>
            <Text sx={{ color: 'secondaryEmphasis', mt: 2 }}>
              Input the amount of MKR to withdraw from the delegate contract.
            </Text>
            <Box sx={{ mt: 3, width: '20rem' }}>
              <Flex sx={{ border: '1px solid #D8E0E3', justifyContent: 'space-between' }}>
                <MKRInput
                  onChange={setMkrToDeposit}
                  placeholder="0.00 MKR"
                  // error={mkrToDeposit.gt(mkrBalance) && 'MKR balance too low'}
                  style={{ border: '0px solid', width: bpi < 1 ? '100%' : null, m: 0 }}
                  ref={input}
                />
                <Button
                  disabled={mkrBalance === undefined}
                  variant="textual"
                  sx={{ width: '100px', fontWeight: 'bold' }}
                  onClick={() => {
                    if (!input.current || mkrBalance === undefined) return;
                    changeInputValue(input.current, mkrBalance.toBigNumber().toString());
                  }}
                >
                  Set max
                </Button>
              </Flex>
              <Flex sx={{ alignItems: 'baseline', mb: 3, alignSelf: 'flex-start' }}>
                <Text
                  sx={{
                    textTransform: 'uppercase',
                    color: 'secondaryEmphasis',
                    fontSize: 1,
                    fontWeight: 'bold'
                  }}
                >
                  MKR Balance:&nbsp;
                </Text>
                {mkrBalance ? (
                  <Text
                    sx={{ cursor: 'pointer', fontSize: 2, mt: 2 }}
                    onClick={() => {
                      if (!input.current) return;
                      changeInputValue(input.current, mkrBalance.toBigNumber().toString());
                    }}
                  >
                    {mkrBalance.toBigNumber().toFormat(6)}
                  </Text>
                ) : (
                  <Box sx={{ width: 6 }}>
                    <Skeleton />
                  </Box>
                )}
              </Flex>
              <Button onClick={freeMkr} sx={{ width: '100%' }}>
                Undelegate MKR
              </Button>
            </Box>
          </Flex>
        </DialogContent>
      </DialogOverlay>
    </>
  );
}
