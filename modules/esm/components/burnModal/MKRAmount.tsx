/*

SPDX-FileCopyrightText: © 2023 Dai Foundation <www.daifoundation.org>

SPDX-License-Identifier: AGPL-3.0-or-later

*/

import { Alert, Flex, Box, Button, Text, Grid, Close } from 'theme-ui';
import { useBreakpointIndex } from '@theme-ui/match-media';
import { BigNumber } from 'ethers';

import { MKRInput } from 'modules/mkr/components/MKRInput';
import { formatValue } from 'lib/string';

type Props = {
  setBurnAmount: (burnAmount: BigNumber) => void;
  burnAmount: BigNumber;
  mkrBalance?: BigNumber;
};

const MKRAmountView = ({ setBurnAmount, burnAmount, mkrBalance }: Props) => {
  const updateInputValue = newVal => {
    setBurnAmount(newVal);
  };

  return (
    <Box sx={{ mt: 4 }}>
      <MKRInput onChange={updateInputValue} balance={mkrBalance} value={burnAmount} />
    </Box>
  );
};

type MKRAmountProps = {
  lockedInChief: BigNumber;
  setBurnAmount: (burnAmount: BigNumber) => void;
  burnAmount: BigNumber;
  setShowDialog: (bool: boolean) => void;
  setStep: (step: string) => void;
  mkrBalance?: BigNumber;
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
          You have {formatValue(lockedInChief)} MKR locked in DSChief. Withdraw MKR from DSChief to burn it in
          the ESM.
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
          disabled={burnAmount.lte(0) || (mkrBalance && burnAmount.gt(mkrBalance))}
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
