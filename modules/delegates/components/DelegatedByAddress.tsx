import { useState } from 'react';
import Link from 'next/link';
import { Box, Text, Link as ThemeUILink, Flex, IconButton } from 'theme-ui';
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

const CollapsableRow = ({ delegator, network, bpi, totalDelegated }: CollapsableRowProps) => {
  const dateFormat = 'MMM dd yyyy h:mm';
  const [expanded, setExpanded] = useState(false);
  const { address, lockAmount, events } = delegator;
  return (
    <tr>
      <Flex as="td" sx={{ flexDirection: 'column' }}>
        <Text sx={{ fontSize: bpi < 1 ? 1 : 3 }}>
          <Link href={{ pathname: `/address/${address}`, query: { network } }} passHref>
            <ThemeUILink title="View address detail">
              <Address address={address} />
            </ThemeUILink>
          </Link>
        </Text>
        {expanded && (
          <Flex sx={{ pl: 3, flexDirection: 'column' }}>
            {events.map(({ blockTimestamp }) => {
              return (
                <Text key={blockTimestamp} variant="smallCaps" sx={{ py: 1 }}>
                  {format(new Date(blockTimestamp), dateFormat)}
                </Text>
              );
            })}
          </Flex>
        )}
      </Flex>
      <Box as="td" sx={{ verticalAlign: 'top' }}>
        <Text sx={{ fontSize: bpi < 1 ? 1 : 3 }}>
          {`${new BigNumber(lockAmount).toFormat(2)}${bpi > 0 ? ' MKR' : ''}`}
        </Text>
        {expanded && (
          <Flex sx={{ flexDirection: 'column' }}>
            {events.map(({ blockTimestamp, lockAmount }) => {
              return (
                <Flex key={blockTimestamp} sx={{ alignItems: 'center', py: 1 }}>
                  {lockAmount.indexOf('-') === 0 ? (
                    <Icon name="decrease" size={2} color="bear" />
                  ) : (
                    <Icon name="increase" size={2} color="bull" />
                  )}
                  <Text key={blockTimestamp} variant="smallCaps" sx={{ pl: 2 }}>
                    {new BigNumber(
                      lockAmount.indexOf('-') === 0 ? lockAmount.substring(1) : lockAmount
                    ).toFormat(2)}
                  </Text>
                </Flex>
              );
            })}
          </Flex>
        )}
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
      <Box as="td" sx={{ textAlign: 'end', verticalAlign: 'top', width: '100%' }}>
        <Flex
          sx={{
            bg: 'background',
            size: 4,
            float: 'right',
            alignItems: 'center',
            justifyContent: 'center',
            borderRadius: 'round'
          }}
        >
          <IconButton aria-label="Delegate history expand" onClick={() => setExpanded(!expanded)}>
            <Icon name={expanded ? 'minus' : 'plus'} />
          </IconButton>
        </Flex>
      </Box>
    </tr>
  );
};

const DelegatedByAddress = ({ delegators, totalDelegated }: DelegatedByAddressProps): JSX.Element => {
  const bpi = useBreakpointIndex();
  const network = getNetwork();

  return (
    <Box>
      <Box mb={3}>
        <Text
          as="p"
          variant="h2"
          sx={{
            fontSize: 4,
            fontWeight: 'semiBold'
          }}
        >
          Delegators
        </Text>
        <Text as="p" variant="secondary" color="onSurface">
          Addresses that have delegated MKR
        </Text>
      </Box>
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
              Total Percent
            </Text>
            <Text as="th" sx={{ textAlign: 'right', pb: 2, width: '20%' }} variant="caps">
              Verify
            </Text>
          </tr>
        </thead>
        <tbody>
          {delegators ? (
            delegators.map((delegator, i) => (
              <CollapsableRow
                key={i}
                delegator={delegator}
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

export default DelegatedByAddress;
