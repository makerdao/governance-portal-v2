import { useState } from 'react';
import Link from 'next/link';
import { Box, Text, Link as ThemeUILink, Flex, IconButton, Heading } from 'theme-ui';
import { useBreakpointIndex } from '@theme-ui/match-media';
import { Icon } from '@makerdao/dai-ui-icons';
import BigNumber from 'bignumber.js';
import { format } from 'date-fns';
import { getNetwork } from 'lib/maker';
import { CurrencyObject } from 'types/currency';
import { Address } from 'modules/address/components/Address';
import Skeleton from 'modules/app/components/SkeletonThemed';
import { DelegationHistory } from 'modules/delegates/types';

type DelegatedByAddressProps = {
  delegators: DelegationHistory[];
  totalDelegated: CurrencyObject;
};

type CollapsableRowProps = {
  delegator: DelegationHistory;
  network: string;
  bpi: number;
  totalDelegated: CurrencyObject;
};

const CollapsableRow = ({ delegate, network, bpi, totalDelegated }: CollapsableRowProps) => {
  const dateFormat = 'MMM dd yyyy h:mm';
  const { address, lockAmount } = delegate;
  return (
    <tr>
      <Flex as="td" sx={{ flexDirection: 'column', mb: 3 }}>
        <Heading variant="microHeading">
          <Link href={{ pathname: `/address/${address}`, query: { network } }} passHref>
            <ThemeUILink title="View address detail" sx={{ fontSize: bpi < 1 ? 1 : 3 }}>
              <Address address={address} />
            </ThemeUILink>
          </Link>
        </Heading>
      </Flex>
      <Box as="td" sx={{ verticalAlign: 'top' }}>
        <Text sx={{ fontSize: bpi < 1 ? 1 : 3 }}>
          {`${new BigNumber(lockAmount).toFormat(2)}${bpi > 0 ? ' MKR' : ''}`}
        </Text>
      </Box>
      <Flex as="td" sx={{ alignSelf: 'flex-start' }}>
        {totalDelegated ? (
          <Text>
            {`${new BigNumber(lockAmount).div(totalDelegated.toBigNumber()).times(100).toFormat(1)}%`}
          </Text>
        ) : (
          <Box sx={{ width: '100%' }}>
            <Skeleton />
          </Box>
        )}
      </Flex>
    </tr>
  );
};

const AddressDelegatedTo = ({ delegatedTo, totalDelegated }: DelegatedByAddressProps): JSX.Element => {
  const bpi = useBreakpointIndex();
  const network = getNetwork();

  return (
    <Box>
      <table
        style={{
          width: '100%',
          borderCollapse: 'collapse'
        }}
      >
        <thead>
          <tr>
            <Text as="th" sx={{ textAlign: 'left', pb: 2, width: '30%' }} variant="caps">
              Address
            </Text>
            <Text as="th" sx={{ textAlign: 'left', pb: 2, width: '30%' }} variant="caps">
              MKR Delegated
            </Text>
            <Text as="th" sx={{ textAlign: 'left', pb: 2, width: '20%' }} variant="caps">
              Voting Weight
            </Text>
          </tr>
        </thead>
        <tbody>
          {delegatedTo ? (
            delegatedTo.map((delegate, i) => (
              <CollapsableRow
                key={i}
                delegate={delegate}
                network={network}
                bpi={bpi}
                totalDelegated={totalDelegated}
              />
            ))
          ) : (
            <tr key={0}>
              <td colSpan={3}>
                <Text color="text" variant="allcaps">
                  Loading
                </Text>
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </Box>
  );
};

export default AddressDelegatedTo;
