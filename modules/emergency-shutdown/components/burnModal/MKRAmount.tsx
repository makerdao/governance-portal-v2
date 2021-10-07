/** @jsx jsx */
import { Alert, Flex, Box, Button, Text, Grid, jsx, Close } from 'theme-ui';
import { useBreakpointIndex } from '@theme-ui/match-media';

import { MKR } from 'lib/maker';
import { MKRInput } from 'modules/mkr/components/MKRInput';
import { CurrencyObject } from 'types/currency';

type Props = {
  setBurnAmount: (burnAmount: CurrencyObject) => void;
  burnAmount: CurrencyObject;
  mkrBalance: CurrencyObject | undefined;
};

const MKRAmountView = ({ setBurnAmount, burnAmount, mkrBalance }: Props) => {
  const updateInputValue = newVal => {
    setBurnAmount(MKR(newVal));
  };

  return (
    <Box sx={{ mt: 4 }}>
      <MKRInput
        onChange={updateInputValue}
        balance={mkrBalance?.toBigNumber()}
        value={burnAmount.toBigNumber()}
      />
    </Box>
  );
};

type MKRAmountProps = {
  lockedInChief: number;
  setBurnAmount: (burnAmount: CurrencyObject) => void;
  burnAmount: CurrencyObject;
  setShowDialog: (bool: boolean) => void;
  setStep: (step: string) => void;
  mkrBalance?: CurrencyObject;
};

const MKRAmount = ({
  lockedInChief,
  setBurnAmount,
  setShowDialog,
  burnAmount,
  setStep,
  mkrBalance
}: MKRAmountProps): React.ReactElement => {
  const bpi = useBreakpointIndex();

  return (
    <Flex sx={{ flexDirection: 'column', alignItems: 'center' }}>
      <Close onClick={() => setShowDialog(false)} sx={{ alignSelf: 'flex-end' }} />
      <Text variant="heading">Enter the amount of MKR to burn</Text>
      <MKRAmountView setBurnAmount={setBurnAmount} burnAmount={burnAmount} mkrBalance={mkrBalance} />
      {lockedInChief ? (
        <Alert variant="notice">
          You have {lockedInChief} MKR locked in DSChief. Withdraw MKR from DSChief to burn it in the ESM.
        </Alert>
      ) : null}
      <Grid columns={[1, 2]} mt={4} sx={{ width: bpi < 1 ? '100%' : undefined }}>
        <Button
          onClick={() => {
            setShowDialog(false);
          }}
          variant="outline"
          sx={{
            color: 'secondary',
            borderColor: 'secondary',
            borderRadius: 'small',
            width: bpi < 1 ? '100%' : undefined
          }}
        >
          Cancel
        </Button>
        <Button
          onClick={() => setStep('confirm')}
          disabled={burnAmount.lte(0) || (mkrBalance && burnAmount.gt(mkrBalance.toBigNumber()))}
          variant="outline"
          sx={{
            color: 'onNotice',
            borderColor: 'notice',
            borderRadius: 'small',
            width: bpi < 1 ? '100%' : undefined
          }}
        >
          Continue
        </Button>
      </Grid>
    </Flex>
  );
};

export default MKRAmount;
