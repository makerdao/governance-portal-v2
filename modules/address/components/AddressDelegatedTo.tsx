import Link from 'next/link';
import { Box, Text, Link as ThemeUILink, Flex, IconButton, Heading } from 'theme-ui';
import { useBreakpointIndex } from '@theme-ui/match-media';
import { Icon } from '@makerdao/dai-ui-icons';

import BigNumber from 'bignumber.js';
import { useActiveWeb3React } from 'modules/web3/hooks/useActiveWeb3React';
import Skeleton from 'modules/app/components/SkeletonThemed';
import { DelegationHistory } from 'modules/delegates/types';
import { useState } from 'react';
import { getEtherscanLink } from 'modules/web3/helpers/getEtherscanLink';
import { formatDateWithTime } from 'lib/datetime';
import Tooltip from 'modules/app/components/Tooltip';
import { SupportedNetworks } from 'modules/web3/constants/networks';
import AddressIconBox from './AddressIconBox';
import { parseUnits } from 'ethers/lib/utils';
import { formatValue } from 'lib/string';

type CollapsableRowProps = {
  delegate: DelegationHistory;
  network: SupportedNetworks;
  bpi: number;
  totalDelegated: number;
};

const CollapsableRow = ({ delegate, network, bpi, totalDelegated }: CollapsableRowProps) => {
  const [expanded, setExpanded] = useState(false);

  const { address, lockAmount, events } = delegate;
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
        <Flex sx={{ alignSelf: 'flex-start' }}>
          {typeof totalDelegated !== 'undefined' ? (
            <Text>{`${
              totalDelegated === 0
                ? '0.0'
                : new BigNumber(lockAmount).div(totalDelegated).times(100).toFormat(1)
            }%`}</Text>
          ) : (
            <Box sx={{ width: '100%' }}>
              <Skeleton />
            </Box>
          )}
        </Flex>
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
            <IconButton aria-label="Delegated to expand" onClick={() => setExpanded(!expanded)}>
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

type AddressDelegatedToProps = {
  delegatedTo: DelegationHistory[];
  totalDelegated: number;
};

const AddressDelegatedTo = ({ delegatedTo, totalDelegated }: AddressDelegatedToProps): JSX.Element => {
  const bpi = useBreakpointIndex();
  const { network } = useActiveWeb3React();

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
            <Tooltip label={'This is the percentage of the total MKR delegated by this address.'}>
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
