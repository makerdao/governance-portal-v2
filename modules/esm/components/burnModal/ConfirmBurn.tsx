/*

SPDX-FileCopyrightText: © 2023 Dai Foundation <www.daifoundation.org>

SPDX-License-Identifier: AGPL-3.0-or-later

*/

import { Dispatch, SetStateAction, useState } from 'react';
import {
  Flex,
  Box,
  Button,
  Text,
  Grid,
  Input,
  Close,
  Label,
  Checkbox,
  Link as ExternalLink,
  Divider
} from 'theme-ui';
import { useBreakpointIndex } from '@theme-ui/match-media';
import { formatValue } from 'lib/string';
import Toggle from '../Toggle';
import { useTokenAllowance } from 'modules/web3/hooks/useTokenAllowance';
import { useApproveUnlimitedToken } from 'modules/web3/hooks/useApproveUnlimitedToken';
import { Tokens } from 'modules/web3/constants/tokens';
import { useChainId } from 'wagmi';
import { esmAddress as esmAddressMapping } from 'modules/contracts/generated';

const ConfirmBurnView = ({
  passValue,
  value,
  setValue,
  burnAmount,
  totalStaked
}: {
  passValue: string;
  value: string;
  setValue: Dispatch<SetStateAction<string>>;
  burnAmount: bigint;
  totalStaked: bigint;
}) => {
  const bpi = useBreakpointIndex();
  return (
    <>
      <Flex
        sx={{
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
          width: '100%',
          mt: bpi < 1 ? 4 : undefined,
          py: 1
        }}
      >
        <Text>Burn amount</Text>
        <Text>{formatValue(burnAmount, 'wad', 6)} MKR</Text>
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
        <Text>{formatValue(burnAmount + totalStaked, 'wad', 6)} MKR</Text>
      </Flex>
      <Text
        variant="microHeading"
        as="p"
        mt={4}
        sx={{ textAlign: bpi < 1 ? 'left' : undefined, alignSelf: 'flex-start' }}
      >
        Enter the following phrase to continue:
      </Text>
      <Flex sx={{ flexDirection: 'column', mt: 3, width: '100%' }}>
        <Input defaultValue={passValue} disabled={true} color={'text'} />
        <Input
          value={value}
          onChange={e => setValue(e.target.value)}
          placeholder={'I am burning...'}
          sx={{ border: '1px solid', borderColor: '#D8E0E3', mt: 2 }}
          data-testid="confirm-input"
        />
      </Flex>
    </>
  );
};

type ConfirmBurnProps = {
  burnAmount: bigint;
  account?: string;
  setShowDialog: (arg: boolean) => void;
  burn: () => void;
  burnDisabled: boolean;
  totalStaked: bigint;
};

const ConfirmBurn = ({
  burnAmount,
  account,
  setShowDialog,
  burn,
  burnDisabled,
  totalStaked
}: ConfirmBurnProps): JSX.Element => {
  const bpi = useBreakpointIndex();
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [mkrApprovePending, setMkrApprovePending] = useState(false);
  const passValue = `I am burning ${formatValue(burnAmount, 'wad', 6)} MKR`;
  const [value, setValue] = useState('');
  const changeTerms = e => {
    setTermsAccepted(e.target.checked);
  };
  const chainId = useChainId();

  const esmAddress = esmAddressMapping[chainId];
  const { data: allowance, mutate: mutateAllowance } = useTokenAllowance(
    Tokens.MKR,
    burnAmount,
    account,
    esmAddress
  );
  const approveMKR = useApproveUnlimitedToken({
    name: Tokens.MKR,
    addressToApprove: esmAddress,
    onSuccess: () => {
      mutateAllowance();
      setMkrApprovePending(false);
    },
    onError: () => {
      setMkrApprovePending(false);
    }
  });

  return (
    <Flex sx={{ flexDirection: 'column' }}>
      <Close onClick={() => setShowDialog(false)} sx={{ alignSelf: 'flex-end' }} />
      <Flex></Flex>
      <Text variant="heading" sx={{ textAlign: 'center' }}>
        Burn your MKR in the ESM
      </Text>
      {bpi < 1 ? (
        <ConfirmBurnView
          passValue={passValue}
          value={value}
          setValue={setValue}
          burnAmount={burnAmount}
          totalStaked={totalStaked}
        />
      ) : (
        <Box sx={{ mt: 3, p: 4 }}>
          <ConfirmBurnView
            passValue={passValue}
            value={value}
            setValue={setValue}
            burnAmount={burnAmount}
            totalStaked={totalStaked}
          />
        </Box>
      )}
      <Flex sx={{ flexDirection: 'row', mt: 3, justifyContent: 'flex-start', alignItems: 'center' }}>
        <Toggle
          active={allowance && !approveMKR.isLoading && approveMKR.prepared}
          onClick={() => {
            setMkrApprovePending(true);
            approveMKR.execute();
          }}
          disabled={mkrApprovePending}
        />
        <Flex ml={3}>
          <Text>Unlock MKR to continue</Text>
        </Flex>
      </Flex>
      <Flex sx={{ flexDirection: 'row', alignItems: 'center', mt: 3 }}>
        <Label data-testid="tosCheck" style={{ width: 'auto', marginRight: '5px' }}>
          <Checkbox checked={termsAccepted} onChange={e => changeTerms(e)} onClick={changeTerms} />
          <Text>I have read and accept the</Text>
        </Label>{' '}
        <Text>
          <ExternalLink href="/terms" target="_blank">
            Terms of Service
          </ExternalLink>
          .
        </Text>
      </Flex>
      <Grid columns={[1, 2]} mt={4} sx={{ width: bpi < 1 ? '100%' : undefined }}>
        <Button
          onClick={() => {
            setShowDialog(false);
          }}
          variant="outline"
          sx={{ color: 'secondary', borderColor: 'secondary' }}
        >
          Cancel
        </Button>
        <Button
          data-testid="continue-burn"
          onClick={burn}
          disabled={!allowance || !termsAccepted || passValue !== value || !account || burnDisabled}
          variant="outline"
          sx={{ color: 'onNotice', borderColor: 'notice' }}
        >
          Continue
        </Button>
      </Grid>
    </Flex>
  );
};

export default ConfirmBurn;
