/** @jsx jsx */
import {
  Flex,
  Box,
  Button,
  Text,
  Grid,
  Input,
  jsx,
  Close,
  Label,
  Checkbox,
  Link,
  Divider,
  Spinner
} from 'theme-ui';
import { useState, useEffect } from 'react';
import useSWR from 'swr';
import shallow from 'zustand/shallow';
import getMaker, { MKR, getNetwork } from '../../lib/maker';
import Address from '../../types/account';
import { Icon } from '@makerdao/dai-ui-icons';
import CurrencyObject from '../../types/currency';
import Toggle from './Toggle';
import useTransactionStore, { transactionsApi, transactionsSelectors } from '../../stores/transactions';
import { getEtherscanLink } from '../../lib/utils';
import { TXMined } from '../../types/transaction';

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
  const [step, setStep] = useState('default');
  const [txId, setTxId] = useState(null);
  const [burnAmount, setBurnAmount] = useState('');
  const { data: mkrBalance } = useSWR(['/user/mkr-balance', address?.address], (_, account) =>
    getMaker().then(maker => maker.getToken(MKR).balanceOf(account))
  );

  const [track, tx] = useTransactionStore(
    state => [state.track, txId ? transactionsSelectors.getTransaction(state, txId) : null],
    shallow
  );

  const close = () => setShowDialog(false);
  const burn = async () => {
    const maker = await getMaker();
    const esm = await maker.service('esm');
    const burnTxObject = esm.stake(burnAmount);
    // const txId = await track(burnTxObject, 'Burning MKR in Emergency Shutdown Module', {
    //   pending: txHash => {
    //     setStep('pending');
    //   },
    //   mined: txId => {
    //     transactionsApi.getState().setMessage(txId, 'Burned MKR in Emergency Shutdown Module');
    //     close(); // TBD maybe show a separate "done" dialog
    //   },
    //   error: () => setStep('failed')
    // });

    // setTxId(txId);
    setStep('signing');
  };

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
          onClick={close}
          variant="outline"
          sx={{ color: '#9FAFB9', borderColor: '#9FAFB9', borderRadius: 'small' }}
        >
          Cancel
        </Button>
        <Button
          onClick={() => setStep('amount')}
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
            onClick={() => setStep('confirm')}
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
            sx={{ border: '1px solid', borderColor: '#D8E0E3', mt: 2 }}
          />
        </Flex>
      </>
    );
  };

  const ConfirmBurn = () => {
    const [mkrApproved, setMkrApproved] = useState(false);
    const [termsAccepted, setTermsAccepted] = useState(false);
    const [mkrApprovePending, setMkrApprovePending] = useState(false);
    const passValue = `I am burning ${burnAmount} MKR`;
    const [value, setValue] = useState('');
    const changeTerms = e => {
      setTermsAccepted(e.target.checked);
    };

    useEffect(() => {
      (async () => {
        if (address) {
          const maker = await getMaker();
          const esmAddress = maker.service('smartContract').getContractAddresses().ESM;
          const connectedWalletAllowance = await maker.getToken(MKR).allowance(address, esmAddress);
          const hasMkrAllowance = connectedWalletAllowance.gte(MKR(burnAmount));
          setMkrApproved(hasMkrAllowance);
        }
      })();
    }, [address, burnAmount]);

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
          <ConfirmBurnView passValue={passValue} value={value} setValue={setValue} />
        ) : (
          <Box sx={{ mt: 3, border: '1px solid #D5D9E0', borderRadius: 'small', p: 4 }}>
            <ConfirmBurnView passValue={passValue} value={value} setValue={setValue} />
          </Box>
        )}
        <Flex sx={{ flexDirection: 'row', mt: 3, justifyContent: 'flex-start', alignItems: 'center' }}>
          <Toggle active={mkrApproved} onClick={giveProxyMkrAllowance} disabled={mkrApprovePending} />
          <Flex ml={3}>
            <Text>Unlock MKR to continue</Text>
            <Icon name="question" ml={2} mt={'6px'} />
          </Flex>
        </Flex>
        <Flex sx={{ flexDirection: 'row', mt: 3 }}>
          <Label>
            <Checkbox checked={termsAccepted} onChange={e => changeTerms(e)} onClick={changeTerms} />
            <Text>
              I have read and accept the <Link>Terms of Service</Link>.
            </Text>
          </Label>
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
            onClick={burn}
            disabled={!mkrApproved || !termsAccepted || passValue !== value || !address}
            variant="outline"
            sx={{ color: 'onNotice', borderColor: 'notice', borderRadius: 'small' }}
          >
            Continue
          </Button>
        </Grid>
      </Flex>
    );
  };

  const BurnSigning = () => (
    <Flex sx={{ flexDirection: 'column', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
      <Close
        aria-label="close"
        sx={{ height: '20px', width: '20px', p: 0, alignSelf: 'flex-end' }}
        onClick={close}
      />

      <Text variant="heading" sx={{ fontSize: 6 }}>
        Sign Transaction
      </Text>
      <Flex sx={{ flexDirection: 'column', alignItems: 'center' }}>
        <Spinner size="60px" sx={{ color: 'primary', alignSelf: 'center', my: 4 }} />
        <Text sx={{ color: 'onSecondary', fontWeight: 'medium', fontSize: 3 }}>
          Please use your wallet to sign this transaction.
        </Text>
        <Button onClick={close} variant="textual" sx={{ mt: 3, color: 'muted', fontSize: 2 }}>
          Cancel burn submission
        </Button>
      </Flex>
    </Flex>
  );

  const BurnPending = () => (
    <Flex sx={{ flexDirection: 'column', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
      <Close
        aria-label="close"
        sx={{ height: '20px', width: '20px', p: 0, alignSelf: 'flex-end' }}
        onClick={close}
      />

      <Text variant="heading" sx={{ fontSize: 6 }}>
        Transaction Sent!
      </Text>
      <Flex sx={{ flexDirection: 'column', alignItems: 'center' }}>
        <Icon name="reviewCheck" size={5} sx={{ my: 4 }} />
        <Text sx={{ color: 'onSecondary', fontWeight: 'medium', fontSize: '16px', textAlign: 'center' }}>
          Vote will update once the blockchain has confirmed the transaction.
        </Text>
        <Link
          target="_blank"
          href={getEtherscanLink(getNetwork(), (tx as TXMined).hash, 'transaction')}
          sx={{ p: 0 }}
        >
          <Text mt={3} px={4} sx={{ textAlign: 'center', fontSize: 14, color: 'accentBlue' }}>
            View on Etherscan
            <Icon name="arrowTopRight" pt={2} color="accentBlue" />
          </Text>
        </Link>
        <Button
          onClick={close}
          sx={{ mt: 4, borderColor: 'primary', width: '100%', color: 'primary' }}
          variant="outline"
        >
          Close
        </Button>
      </Flex>
    </Flex>
  );

  const BurnFailed = () => (
    <Flex sx={{ flexDirection: 'column', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
      <Close
        aria-label="close"
        sx={{ height: '20px', width: '20px', p: 0, alignSelf: 'flex-end' }}
        onClick={close}
      />
      <Text variant="heading" sx={{ fontSize: 6 }}>
        Transaction Failed.
      </Text>
      <Flex sx={{ flexDirection: 'column', alignItems: 'center' }}>
        <Icon name="reviewFailed" size={5} sx={{ my: 3 }} />
        <Text sx={{ color: 'onSecondary', fontWeight: 'medium', fontSize: '16px' }}>
          Something went wrong with your transaction. Please try again.
        </Text>
        <Button
          onClick={close}
          sx={{ mt: 5, borderColor: 'primary', width: '100%', color: 'primary' }}
          variant="outline"
        >
          Close
        </Button>
      </Flex>
    </Flex>
  );

  switch (step) {
    case 'default':
      return <DefaultScreen />;
    case 'amount':
      return <MKRAmount />;
    case 'confirm':
      return <ConfirmBurn />;
    case 'signing':
      return <BurnSigning />;
    case 'pending':
      return <BurnPending />;
    case 'failed':
      return <BurnFailed />;
    default:
      return <DefaultScreen />;
  }
};

export default ModalContent;
