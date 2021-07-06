import { Button, Flex, Text, Link as ExternalLink } from 'theme-ui';
import { getNetwork } from 'lib/maker';
import { getEtherscanLink } from 'lib/utils';
import { Delegate } from 'types/delegate';

type Props = {
  mkrToDeposit: any;
  delegate: Delegate;
  onClick: () => void;
  onBack: () => void;
};

const ConfirmContent = ({ mkrToDeposit, delegate, onClick, onBack }: Props): JSX.Element => {
  const { delegateAddress, voteDelegateAddress } = delegate;
  return (
    <Flex sx={{ flexDirection: 'column', textAlign: 'center' }}>
      <Text variant="microHeading" sx={{ fontSize: [3, 6] }}>
        Confirm transaction
      </Text>
      <Text sx={{ mt: 4 }}>
        You are delegating{' '}
        <Text sx={{ fontWeight: 'bold', display: 'inline' }}>
          {mkrToDeposit.toBigNumber().toFormat(6)} MKR
        </Text>{' '}
        to delegate contract{' '}
        <ExternalLink
          title="View on etherescan"
          href={getEtherscanLink(getNetwork(), voteDelegateAddress, 'address')}
          target="_blank"
        >
          <Text sx={{ fontWeight: 'bold', color: 'text', display: 'inline', ':hover': { color: 'inherit' } }}>
            {voteDelegateAddress}
          </Text>
        </ExternalLink>
      </Text>
      <Text sx={{ color: 'secondaryEmphasis', mt: 4 }}>
        This delegate contract was created by{' '}
        <ExternalLink
          title="View on etherescan"
          href={getEtherscanLink(getNetwork(), delegateAddress, 'address')}
          target="_blank"
        >
          <Text sx={{ fontWeight: 'bold', color: 'text', display: 'inline', ':hover': { color: 'inherit' } }}>
            {delegateAddress}
          </Text>
        </ExternalLink>
      </Text>
      <Button onClick={onClick} sx={{ mt: 4 }}>
        Confirm Transaction
      </Button>
      <Button onClick={onBack} variant="textual" sx={{ color: 'muted', fontSize: 2, mt: 1 }}>
        Back
      </Button>
    </Flex>
  );
};

export default ConfirmContent;
