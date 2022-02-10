import { useState } from 'react';
import Link from 'next/link';
import { Box, Text, Link as ThemeUILink, Flex, IconButton, Heading } from 'theme-ui';
import { useBreakpointIndex } from '@theme-ui/match-media';
import { Icon } from '@makerdao/dai-ui-icons';
import Skeleton from 'modules/app/components/SkeletonThemed';
import Tooltip from 'modules/app/components/Tooltip';
import { DelegationHistory } from 'modules/delegates/types';
import { getEtherscanLink } from 'modules/web3/helpers/getEtherscanLink';
import { formatDateWithTime } from 'lib/datetime';
import { useActiveWeb3React } from 'modules/web3/hooks/useActiveWeb3React';
import { SupportedNetworks } from 'modules/web3/constants/networks';
import { BigNumber } from 'ethers';
import { formatValue } from 'lib/string';
import { parseUnits } from 'ethers/lib/utils';
import { BigNumber as BigNumberJS } from 'bignumber.js';
import AddressIconBox from 'modules/address/components/AddressIconBox';

type DelegatedByAddressProps = {
  delegators: DelegationHistory[];
  totalDelegated: BigNumber;
};

type CollapsableRowProps = {
  delegator: DelegationHistory;
  network: SupportedNetworks;
  bpi: number;
  totalDelegated: BigNumber;
};

const formatTotalDelegated = (num: BigNumber, denom: BigNumber): string => {
  try {
    // Use bignumber.js to do division because ethers BigNumber does not support decimals
    const numB = new BigNumberJS(num.toString());
    const denomB = new BigNumberJS(denom.toString());

    const weight = numB.div(denomB).times(100);
    return formatValue(parseUnits(weight.toString()));
  } catch (e) {
    return '0.0';
  }
};

const CollapsableRow = ({ delegator, network, bpi, totalDelegated }: CollapsableRowProps) => {
  const [expanded, setExpanded] = useState(false);
  const { address, lockAmount, events } = delegator;
  const sortedEvents = events.sort((prev, next) => (prev.blockTimestamp > next.blockTimestamp ? -1 : 1));
  return (
    <tr>
      <Flex as="td" sx={{ flexDirection: 'column', mb: 3 }}>
        <Heading variant="microHeading">
          <Link href={{ pathname: `/address/${address}` }} passHref>
            <ThemeUILink title="View address detail" sx={{ fontSize: bpi < 1 ? 1 : 3 }}>
              <AddressIconBox address={address} width={41} />
            </ThemeUILink>
          </Link>
        </Heading>
        {expanded && (
          <Flex sx={{ pl: 3, flexDirection: 'column' }}>
            {sortedEvents.map(({ blockTimestamp }) => {
              return (
                <Text
                  key={blockTimestamp}
                  variant="smallCaps"
                  sx={{
                    ':first-of-type': { pt: 2 },
                    ':not(:last-of-type)': { pb: 2 }
                  }}
                >
                  {formatDateWithTime(blockTimestamp)}
                </Text>
              );
            })}
          </Flex>
        )}
      </Flex>
      <Box as="td" sx={{ verticalAlign: 'top', pt: 2 }}>
        <Text sx={{ fontSize: bpi < 1 ? 1 : 3 }}>
          {`${formatValue(parseUnits(lockAmount))}${bpi > 0 ? ' MKR' : ''}`}
        </Text>
        {expanded && (
          <Flex sx={{ flexDirection: 'column' }}>
            {sortedEvents.map(({ blockTimestamp, lockAmount }) => {
              return (
                <Flex
                  key={blockTimestamp}
                  sx={{
                    alignItems: 'center',
                    ':first-of-type': { pt: 3 },
                    ':not(:last-of-type)': { pb: 2 }
                  }}
                >
                  {lockAmount.indexOf('-') === 0 ? (
                    <Icon name="decrease" size={2} color="bear" />
                  ) : (
                    <Icon name="increase" size={2} color="bull" />
                  )}
                  <Text key={blockTimestamp} variant="smallCaps" sx={{ pl: 2 }}>
                    {`${formatValue(
                      parseUnits(lockAmount.indexOf('-') === 0 ? lockAmount.substring(1) : lockAmount)
                    )}${bpi > 0 ? ' MKR' : ''}`}
                  </Text>
                </Flex>
              );
            })}
          </Flex>
        )}
      </Box>
      <Box as="td" sx={{ verticalAlign: 'top', pt: 2 }}>
        {totalDelegated ? (
          <Text>{`${formatTotalDelegated(parseUnits(lockAmount), totalDelegated)}%`}</Text>
        ) : (
          <Box sx={{ width: '100%' }}>
            <Skeleton />
          </Box>
        )}
      </Box>
      <Box as="td" sx={{ textAlign: 'end', verticalAlign: 'top', width: '100%', pt: 2 }}>
        <Box sx={{ height: '32px' }}>
          <Flex
            sx={{
              bg: 'background',
              size: 'auto',
              width: '17px',
              height: '17px',
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
        {expanded && (
          <Flex sx={{ flexDirection: 'column' }}>
            {sortedEvents.map(({ blockTimestamp, hash }) => {
              return (
                <Flex
                  key={blockTimestamp}
                  sx={{
                    justifyContent: 'flex-end',
                    lineHeight: '20px',
                    ':not(:last-of-type)': { pb: 2 }
                  }}
                >
                  <ThemeUILink
                    href={getEtherscanLink(network, hash as string, 'transaction')}
                    target="_blank"
                    title="View on Etherscan"
                    sx={{
                      textAlign: 'right'
                    }}
                  >
                    <Icon name="arrowTopRight" size={2} />
                  </ThemeUILink>
                </Flex>
              );
            })}
          </Flex>
        )}
      </Box>
    </tr>
  );
};

const DelegatedByAddress = ({ delegators, totalDelegated }: DelegatedByAddressProps): JSX.Element => {
  const bpi = useBreakpointIndex();
  const { network } = useActiveWeb3React();

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
          Addresses that have delegated MKR to this delegate
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
            <Tooltip label={'This is the percentage of the total MKR delegated to this delegate.'}>
              <Text as="th" sx={{ textAlign: 'left', pb: 2, width: '20%' }} variant="caps">
                Voting Weight
              </Text>
            </Tooltip>
            <Text as="th" sx={{ textAlign: 'right', pb: 2, width: '20%' }} variant="caps">
              Expand
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
