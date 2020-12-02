/** @jsx jsx */
import { useRef } from 'react';
import { Flex, Box, Button, Text, Grid, jsx, Close } from 'theme-ui';
import { useBreakpointIndex } from '@theme-ui/match-media';

import CurrencyObject from '../../../types/currency';
import { MKR } from '../../../lib/maker';
import MKRInput from '../../../components/MKRInput';
import { changeInputValue } from '../../../lib/utils';

type MKRAmoutnViewProps = {
  setBurnAmount: (burnAmount: CurrencyObject) => void;
  burnAmount: CurrencyObject;
  mkrBalance: CurrencyObject | undefined;
};

const MKRAmountView = ({ setBurnAmount, burnAmount, mkrBalance }: MKRAmoutnViewProps) => {
  const bpi = useBreakpointIndex();
  const input = useRef<HTMLInputElement>(null);
  const updateInputValue = newVal => {
    setBurnAmount(MKR(newVal));
  };

  return (
    <>
      <Text
        variant="microHeading"
        mt={bpi < 1 ? 4 : null}
        sx={{ textAlign: bpi < 1 ? 'left' : null, alignSelf: 'flex-start' }}
      >
        Enter the amount of MKR to burn.
      </Text>
      <Flex sx={{ border: '1px solid #D8E0E3', mt: 3, width: '100%' }}>
        <MKRInput
          onChange={updateInputValue}
          placeholder="0.00 MKR"
          error={mkrBalance && burnAmount.gt(mkrBalance) && 'MKR balance too low'}
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

      <Flex mt={3} sx={{ alignItems: 'center', justifyContent: 'flex-start', width: '100%' }}>
        <Text variant="caps">MKR Balance In Wallet</Text>
        <Text ml={3}>{mkrBalance ? mkrBalance.toString() : '---'}</Text>
      </Flex>
    </>
  );
};

type MKRAmountProps = {
  lockedInChief: number;
  setBurnAmount: (burnAmount: CurrencyObject) => void;
  burnAmount: CurrencyObject;
  setShowDialog: (bool: boolean) => void;
  setStep: (step: string) => void;
  mkrBalance: CurrencyObject | undefined;
};

const MKRAmount = ({
  lockedInChief,
  setBurnAmount,
  setShowDialog,
  burnAmount,
  setStep,
  mkrBalance
}: MKRAmountProps) => {
  const bpi = useBreakpointIndex();

  return (
    <Flex sx={{ flexDirection: 'column', alignItems: 'center' }}>
      <Close onClick={() => setShowDialog(false)} sx={{ alignSelf: 'flex-end' }} />
      <Text variant="heading">Burn your MKR in the ESM</Text>
      {bpi < 1 ? (
        <MKRAmountView setBurnAmount={setBurnAmount} burnAmount={burnAmount} mkrBalance={mkrBalance} />
      ) : (
        <Box sx={{ mt: 3, border: '1px solid #D5D9E0', borderRadius: 'small', px: [3, 5], py: 4 }}>
          <MKRAmountView setBurnAmount={setBurnAmount} burnAmount={burnAmount} mkrBalance={mkrBalance} />
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
            fontSize: 1,
            mt: 3
          }}
          data-testid="voting-power"
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
          onClick={() => setStep('confirm')}
          disabled={burnAmount.lte(0) || (mkrBalance && burnAmount.gt(mkrBalance))}
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

export default MKRAmount;
