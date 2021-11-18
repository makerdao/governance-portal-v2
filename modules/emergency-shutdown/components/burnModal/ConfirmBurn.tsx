import { useState, useEffect } from 'react';
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
import getMaker, { MKR } from 'lib/maker';
import Toggle from '../Toggle';

const ConfirmBurnView = ({ passValue, value, setValue, burnAmount, totalStaked }) => {
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
        <Text>{burnAmount.toString()}</Text>
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
        <Text>{burnAmount.add(totalStaked).toString()}</Text>
      </Flex>
      <Text
        variant="microHeading"
        mt={4}
        sx={{ textAlign: bpi < 1 ? 'left' : undefined, alignSelf: 'flex-start' }}
      >
        Enter the following phrase to continue.
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

const ConfirmBurn = ({ burnAmount, account, setShowDialog, burn, totalStaked }) => {
  const bpi = useBreakpointIndex();
  const [mkrApproved, setMkrApproved] = useState(false);
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [mkrApprovePending, setMkrApprovePending] = useState(false);
  const passValue = `I am burning ${burnAmount}`;
  const [value, setValue] = useState('');
  const changeTerms = e => {
    setTermsAccepted(e.target.checked);
  };

  useEffect(() => {
    (async () => {
      if (account) {
        const maker = await getMaker();
        const esmAddress = maker.service('smartContract').getContractAddresses().ESM;
        const connectedWalletAllowance = await maker.getToken(MKR).allowance(account?.address, esmAddress);
        const hasMkrAllowance = connectedWalletAllowance.gte(MKR(burnAmount));
        setMkrApproved(hasMkrAllowance);
      }
    })();
  }, [account, burnAmount]);

  const giveProxyMkrAllowance = async () => {
    setMkrApprovePending(true);
    const maker = await getMaker();
    const esmAddress = maker.service('smartContract').getContractAddresses().ESM;
    // setMkrApproved(true);
    try {
      await maker.getToken(MKR).approve(esmAddress, burnAmount);
      setMkrApproved(true);
    } catch (err) {
      const message = err.message ? err.message : err;
      const errMsg = `unlock mkr tx failed ${message}`;
      console.error(errMsg);
    }
    setMkrApprovePending(false);
  };

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
          active={mkrApproved}
          onClick={giveProxyMkrAllowance}
          disabled={mkrApprovePending}
          data-testid="allowance-toggle"
        />
        <Flex ml={3}>
          <Text>Unlock MKR to continue</Text>
        </Flex>
      </Flex>
      <Flex sx={{ flexDirection: 'row', mt: 3 }}>
        <Label>
          <Checkbox
            checked={termsAccepted}
            onChange={e => changeTerms(e)}
            onClick={changeTerms}
            data-testid="tosCheck"
          />
          <Text>
            I have read and accept the{' '}
            <ExternalLink href="/terms" target="_blank">
              Terms of Service
            </ExternalLink>
            .
          </Text>
        </Label>
      </Flex>
      <Grid columns={[1, 2]} mt={4} sx={{ width: bpi < 1 ? '100%' : undefined }}>
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
          onClick={burn}
          disabled={!mkrApproved || !termsAccepted || passValue !== value || !account?.address}
          variant="outline"
          sx={{ color: 'onNotice', borderColor: 'notice', borderRadius: 'small' }}
        >
          Continue
        </Button>
      </Grid>
    </Flex>
  );
};

export default ConfirmBurn;
