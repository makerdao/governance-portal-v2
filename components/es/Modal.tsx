/** @jsx jsx */
import { Flex, Box, Button, Text, Grid, Input, jsx, Close } from 'theme-ui';
import { useState } from 'react';
import useSWR from 'swr';
import getMaker, { MKR } from '../../lib/maker';
import Address from '../../types/account';
import { Icon } from '@makerdao/dai-ui-icons';

const ModalContent = ({
  address,
  setShowDialog,
  bpi,
  lockedInChief
}: {
  address: Address | undefined;
  setShowDialog: (value: boolean) => void;
  bpi: number;
  lockedInChief: number;
}) => {
  const [step, setStep] = useState(0);
  const { data: mkrBalance } = useSWR(['/user/mkr-balance', address?.address], (_, account) =>
    getMaker().then(maker => maker.getToken(MKR).balanceOf(account))
  );
  const [stakeAmount, setStakeAmount] = useState('');

  const DefaultScreen = () => (
    <Flex sx={{ flexDirection: 'column', alignItems: 'center' }}>
      <Close onClick={() => setShowDialog(false)} sx={{ alignSelf: 'flex-end' }} />
      <Icon ml={2} name="warning" size={5} sx={{ color: 'notice' }} />
      <Text variant="heading" mt={4}>
        Are you sure you want to burn MKR?
      </Text>
      <Text variant="text" sx={{ mt: 3 }}>
        By burning your MKR in the ESM, you are contributing to the shutdown of the Dai Credit System. Your
        MKR will be immediately burned and cannot be retrieved.
      </Text>
      <Grid columns={2} mt={4}>
        <Button
          onClick={() => setShowDialog(false)}
          variant="outline"
          sx={{ color: '#9FAFB9', borderColor: '#9FAFB9', borderRadius: 'small' }}
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

  const MKRAmountView = () => (
    <>
      <Text
        variant="microHeading"
        mt={bpi < 1 ? 4 : null}
        sx={{ textAlign: bpi < 1 ? 'left' : null, alignSelf: 'flex-start' }}
      >
        Enter the amount of MKR to burn.
      </Text>
      <Flex sx={{ border: '1px solid #D8E0E3', mt: 3, width: '100%' }}>
        <Input
          sx={{ border: '0px solid', width: bpi < 1 ? '100%' : null, m: 0 }}
          onChange={e => setStakeAmount(e.target.value)}
          value={stakeAmount}
          placeholder="0.00 MKR"
        />
        <Button
          variant="textual"
          sx={{ width: '100px', fontWeight: 'bold' }}
          onClick={() => setStakeAmount(mkrBalance?.toString())}
        >
          Set max
        </Button>
      </Flex>

      <Flex mt={3} sx={{ alignItems: 'center', justifyContent: 'flex-start', width: '100%' }}>
        <Text variant="caps">MKR Balance In Wallet</Text>
        <Text ml={3}>{mkrBalance ? mkrBalance.toString() : '---'}</Text>
      </Flex>
    </>
  );

  const MKRAmount = () => {
    return (
      <Flex sx={{ flexDirection: 'column', alignItems: 'center' }}>
        <Close onClick={() => setShowDialog(false)} sx={{ alignSelf: 'flex-end' }} />
        <Text variant="heading">Burn your MKR in the ESM</Text>
        {bpi < 1 ? (
          <MKRAmountView />
        ) : (
          <Box sx={{ mt: 3, border: '1px solid #D5D9E0', borderRadius: 'small', px: [3, 5], py: 4 }}>
            <MKRAmountView />
          </Box>
        )}
        {lockedInChief ? (
          <Flex
            sx={{
              flexDirection: 'column',
              width: '100%',
              justifyContent: 'center',
              alignItems: 'center',
              border: '1px solid #FBCC5F',
              borderRadius: 'medium',
              backgroundColor: '#FFF9ED',
              color: '#826318',
              p: 3,
              fontSize: '12px',
              mt: 3
            }}
          >
            <Text sx={{ textAlign: 'center' }}>You have {lockedInChief} MKR locked in DSChief.</Text>
            <Text sx={{ textAlign: 'center' }}>Withdraw MKR from DSChief to burn it in the ESM.</Text>
          </Flex>
        ) : null}
        <Grid columns={[1, 2]} mt={4} sx={{ width: bpi < 1 ? '100%' : null }}>
          <Button
            onClick={() => {
              setShowDialog(false);
            }}
            variant="outline"
            sx={{
              color: 'secondary',
              borderColor: 'secondary',
              borderRadius: 'small',
              width: bpi < 1 ? '100%' : null
            }}
          >
            Cancel
          </Button>
          <Button
            onClick={() => setStep(2)}
            variant="outline"
            sx={{
              color: 'onNotice',
              borderColor: 'notice',
              borderRadius: 'small',
              width: bpi < 1 ? '100%' : null
            }}
          >
            Continue
          </Button>
        </Grid>
      </Flex>
    );
  };

  const ConfirmBurn = () => {
    return (
      <Flex sx={{ flexDirection: 'column', alignItems: 'center' }}>
        <Close onClick={() => setShowDialog(false)} sx={{ alignSelf: 'flex-end' }} />
        <Text>Confirm that Burn Baby</Text>
        <Grid columns={[1, 2]} mt={4} sx={{ width: bpi < 1 ? '100%' : null }}>
          <Button
            onClick={() => {
              setShowDialog(false);
            }}
            variant="outline"
            sx={{ color: 'secondary', borderColor: 'secondary', borderRadius: 'small' }}
          >
            Cancel
          </Button>
          <Button
            onClick={() => setStep(3)}
            variant="outline"
            sx={{ color: 'onNotice', borderColor: 'notice', borderRadius: 'small' }}
          >
            Continue
          </Button>
        </Grid>
      </Flex>
    );
  };

  switch (step) {
    case 0:
      return <DefaultScreen />;
    case 1:
      return <MKRAmount />;
    case 2:
      return <ConfirmBurn />;
    default:
      return <DefaultScreen />;
  }
};

export default ModalContent;
