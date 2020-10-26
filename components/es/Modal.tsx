/** @jsx jsx */
import { Flex, Box, Button, Text, Grid, Input, jsx, Close } from 'theme-ui';
import { useState } from 'react';
import useSWR from 'swr';
import getMaker, { MKR } from '../../lib/maker';
import Address from '../../types/account';
import { Icon } from '@makerdao/dai-ui-icons';

const ModalContent = ({
  address,
  setShowDialog
}: {
  address: Address | undefined;
  setShowDialog: (value: boolean) => void;
}) => {
  const [step, setStep] = useState(0);
  const { data: mkrBalance } = useSWR(['/user/mkr-balance', address?.address], (_, account) =>
    getMaker().then(maker => maker.getToken(MKR).balanceOf(account))
  );

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

  const MKRAmount = () => {
    const [stakeAmount, setStakeAmount] = useState(0);
    return (
      <Flex sx={{ flexDirection: 'column', alignItems: 'center' }}>
        <Close onClick={() => setShowDialog(false)} sx={{ alignSelf: 'flex-end' }} />
        <Text variant="heading">Burn your MKR in the ESM</Text>
        <Box sx={{ mt: 3, border: '1px solid #D5D9E0', borderRadius: 'small', px: 5, py: 4 }}>
          <Text variant="microHeading">Enter the amount of MKR to burn</Text>
          <Flex sx={{ border: '1px solid #D8E0E3', mt: 3 }}>
            <Input sx={{ border: '0px solid' }} value={`${stakeAmount.toFixed(2)} MKR`} />
            <Button
              variant="textual"
              sx={{ width: '100px', fontWeight: 'bold' }}
              onClick={() => setStakeAmount(mkrBalance)}
            >
              Set max
            </Button>
          </Flex>

          <Flex mt={3} sx={{ alignItems: 'center' }}>
            <Text variant="caps">MKR Balance In Wallet</Text>
            <Text ml={3}>{mkrBalance ? mkrBalance.toString() : '---'}</Text>
          </Flex>
        </Box>
        <Grid columns={2} mt={4}>
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
            onClick={() => setStep(2)}
            variant="outline"
            sx={{ color: 'onNotice', borderColor: 'notice', borderRadius: 'small' }}
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
        <Grid columns={2} mt={4}>
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
            onClick={() => setStep(2)}
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
