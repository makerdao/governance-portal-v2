/** @jsx jsx */
import { Button, Flex, Link, Text, jsx } from 'theme-ui';
import { Icon } from '@makerdao/dai-ui-icons';
import TxIndicators from 'components/TxIndicators';
import { TXMined } from 'types/transaction';
import { getNetwork } from 'lib/maker';
import { getEtherscanLink } from 'lib/utils';

const TxComplete = ({ title, description, buttonLabel, onClick, tx, success }) => (
  <Flex sx={{ flexDirection: 'column', textAlign: 'center' }}>
    <Text variant="microHeading" color="onBackgroundAlt">
      {title}
    </Text>
    {success ? (
      <Flex sx={{ alignItems: 'center', justifyContent: 'center', mt: 4 }}>
        <TxIndicators.Success sx={{ width: 6 }} />
      </Flex>
    ) : (
      <Flex sx={{ alignItems: 'center', justifyContent: 'center', mt: 4 }}>
        <TxIndicators.Failed sx={{ width: 6 }} />
      </Flex>
    )}
    <Text sx={{ color: 'secondaryEmphasis', mt: 3 }}>{description}</Text>
    <Link
      target="_blank"
      href={getEtherscanLink(getNetwork(), (tx as TXMined).hash, 'transaction')}
      sx={{ my: 3 }}
    >
      <Text mt={3} px={4} sx={{ textAlign: 'center', fontSize: 14, color: 'accentBlue' }}>
        View on Etherscan
        <Icon name="arrowTopRight" pt={2} color="accentBlue" />
      </Text>
    </Link>
    <Button onClick={onClick} sx={{ width: '100%', mt: 3 }}>
      {buttonLabel}
    </Button>
  </Flex>
);

export default TxComplete;
