/** @jsx jsx */
import BigNumber from 'bignumber.js';
import { useMkrDelegated } from 'lib/hooks';
import useAccountsStore from 'stores/accounts';
import { Box, Flex, Text, jsx } from 'theme-ui';
import { Delegate } from '../types';

export function DelegateMKRDelegatedStats({ delegate }: { delegate: Delegate }): React.ReactElement {
  const account = useAccountsStore(state => state.currentAccount);
  const address = account?.address;

  const { data: mkrStaked } = useMkrDelegated(address, delegate.voteDelegateAddress);

  const styles = {
    row: {
      m: 1
    },
    text: {
      color: 'secondaryAlt',
      fontWeight: 'semiBold',
      fontSize: 5
    },
    subtext: {
      color: 'secondaryEmphasis',
      fontSize: 3
    }
  };

  return (
    <Flex
      sx={{
        display: 'flex',
        justifyContent: 'space-between',
        flexDirection: ['column', 'row'],
        marginTop: 1,
        marginBottom: 1
      }}
    >
      <Box sx={styles.row} mr={2}>
        <Text as="p" sx={styles.text}>
          {new BigNumber(delegate.mkrDelegated).toFormat(2) ?? 'Untracked'}
        </Text>
        <Text as="p" sx={styles.subtext}>
          Total MKR Delegated
        </Text>
      </Box>

      {/* TODO add once we have data */}
      {/* <Box sx={styles.row} ml={2} mr={2}>
        <Text as="p" sx={styles.text}>
          TBD
        </Text>
        <Text as="p" sx={styles.subtext}>
          MKR Holders represented
        </Text>
      </Box> */}

      <Box sx={styles.row} ml={2}>
        <Text as="p" sx={styles.text}>
          {mkrStaked ? mkrStaked.toBigNumber().toFormat(2) : '0.00'}
        </Text>
        <Text as="p" sx={styles.subtext}>
          MKR Delegated by you
        </Text>
      </Box>
    </Flex>
  );
}
