/** @jsx jsx */
import { Flex, Box, Button, Text, Grid, Input, jsx, Close, Checkbox, Link, Divider } from 'theme-ui';
import { useState } from 'react';
import useSWR from 'swr';
import getMaker, { MKR } from '../../lib/maker';
import Address from '../../types/account';
import { Icon } from '@makerdao/dai-ui-icons';
import CurrencyObject from '../../types/currency';
import Toggle from '../../components/es/Toggle';

const ModalContent = ({
  address,
  setShowDialog,
  bpi,
  lockedInChief,
  totalStaked
}: {
  address: Address | undefined;
  setShowDialog: (value: boolean) => void;
  bpi: number;
  lockedInChief: number;
  totalStaked: CurrencyObject;
}) => {
  const [step, setStep] = useState(0);
  const { data: mkrBalance } = useSWR(['/user/mkr-balance', address?.address], (_, account) =>
    getMaker().then(maker => maker.getToken(MKR).balanceOf(account))
  );
  const [burnAmount, setBurnAmount] = useState('');

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
          onChange={e => setBurnAmount(e.target.value)}
          value={burnAmount}
          placeholder="0.00 MKR"
        />
        <Button
          variant="textual"
          sx={{ width: '100px', fontWeight: 'bold' }}
          onClick={() => setBurnAmount(mkrBalance?.toString())}
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
            disabled={!burnAmount}
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

  const ConfirmBurnView = ({ passValue, value, setValue }) => {
    return (
      <>
        <Flex
          sx={{
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            width: '100%',
            mt: bpi < 1 ? 4 : null,
            py: 1
          }}
        >
          <Text>Burn amount</Text>
          <Text>{burnAmount} MKR</Text>
        </Flex>
        <Divider />
        <Flex
          sx={{
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            width: '100%',
            py: 1
          }}
        >
          <Text>New ESM total</Text>
          <Text>{parseFloat(burnAmount) + totalStaked?.toNumber()} MKR</Text>
        </Flex>
        <Text
          variant="microHeading"
          mt={4}
          sx={{ textAlign: bpi < 1 ? 'left' : null, alignSelf: 'flex-start' }}
        >
          Enter the following phrase to continue.
        </Text>
        <Flex sx={{ flexDirection: 'column', mt: 3, width: '100%' }}>
          <Input
            defaultValue={passValue}
            disabled={true}
            backgroundColor={'#F6F8F9'}
            sx={{ border: '1px solid', borderColor: '#D8E0E3' }}
          />
          <Input
            value={value}
            onChange={e => setValue(e.target.value)}
            placeholder={'I am burning...'}
            disabled={true}
            sx={{ border: '1px solid', borderColor: '#D8E0E3', mt: 2 }}
          />
        </Flex>
      </>
    );
  };

  const ConfirmBurn = () => {
    const [mkrApproved, setMkrApproved] = useState(false);
    const [termsAccepted, setTermsAccepted] = useState(false);
    const passValue = `I am burning ${burnAmount} MKR`;
    const [value, setValue] = useState('');

    return (
      <Flex sx={{ flexDirection: 'column' }}>
        <Close onClick={() => setShowDialog(false)} sx={{ alignSelf: 'flex-end' }} />
        <Flex></Flex>
        <Text variant="heading" sx={{ textAlign: 'center' }}>
          Burn your MKR in the ESM
        </Text>
        {bpi < 1 ? (
          <ConfirmBurnView passValue={passValue} value={value} setValue={setValue} />
        ) : (
          <Box sx={{ mt: 3, border: '1px solid #D5D9E0', borderRadius: 'small', p: 4 }}>
            <ConfirmBurnView passValue={passValue} value={value} setValue={setValue} />
          </Box>
        )}
        <Flex sx={{ flexDirection: 'row', mt: 3, justifyContent: 'flex-start', alignItems: 'center' }}>
          <Toggle active={mkrApproved} onClick={setMkrApproved} />
          <Flex ml={3}>
            <Text>Unlock MKR to continue</Text>
            <Icon name="question" ml={2} mt={'6px'} />
          </Flex>
        </Flex>
        <Flex sx={{ flexDirection: 'row', mt: 3 }}>
          <Checkbox checked={termsAccepted} onClick={() => setTermsAccepted(!termsAccepted)} />
          <Text>
            I have read and accept the <Link>Terms of Service</Link>.
          </Text>
        </Flex>
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
            disabled={!mkrApproved || !termsAccepted || passValue !== value}
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
