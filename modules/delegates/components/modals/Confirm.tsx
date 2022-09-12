import { Button, Flex, Text, Link as ExternalLink } from 'theme-ui';
import { getEtherscanLink } from 'modules/web3/helpers/getEtherscanLink';
import { Delegate } from '../../types';
import { useWeb3 } from 'modules/web3/hooks/useWeb3';
import { BigNumber } from 'ethers';
import { formatValue } from 'lib/string';

type Props = {
  mkrToDeposit: BigNumber;
  delegate: Delegate;
  onClick: () => void;
  onBack: () => void;
};

export const ConfirmContent = ({ mkrToDeposit, delegate, onClick, onBack }: Props): JSX.Element => {
  const { address, voteDelegateAddress } = delegate;
  const { network } = useWeb3();

  return (
    <Flex sx={{ flexDirection: 'column', textAlign: 'center' }}>
      <Text variant="microHeading" sx={{ fontSize: [3, 6] }}>
        Confirm Transaction
      </Text>
      <Text sx={{ mt: 4 }}>
        You are delegating{' '}
        <Text sx={{ fontWeight: 'bold', display: 'inline' }}>{formatValue(mkrToDeposit, 'wad', 6)} MKR</Text>{' '}
        to delegate contract{' '}
        <ExternalLink
          title="View on etherescan"
          href={getEtherscanLink(network, voteDelegateAddress, 'address')}
          target="_blank"
        >
          <Text
            sx={{
              fontWeight: 'bold',
              color: 'accentsBlue',
              display: 'inline',
              ':hover': { color: 'inherit' },
              fontSize: [1, 2]
            }}
          >
            {voteDelegateAddress}
          </Text>
        </ExternalLink>
      </Text>
      <Text sx={{ color: 'secondaryEmphasis', mt: 4 }}>
        This delegate contract was created by{' '}
        <ExternalLink
          title="View on etherescan"
          href={getEtherscanLink(network, address, 'address')}
          target="_blank"
        >
          <Text
            sx={{
              fontWeight: 'bold',
              color: 'accentsBlue',
              display: 'inline',
              ':hover': { color: 'inherit' },
              fontSize: [1, 2]
            }}
          >
            {address}
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
