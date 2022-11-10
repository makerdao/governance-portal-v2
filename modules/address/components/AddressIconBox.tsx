import React from 'react';
import AddressIcon from './AddressIcon';
import { Box, Text, Flex } from 'theme-ui';
import { Icon } from '@makerdao/dai-ui-icons';
import { Address } from './Address';
import Tooltip from 'modules/app/components/Tooltip';
import { useWeb3 } from 'modules/web3/hooks/useWeb3';
import { useAccount } from 'modules/app/hooks/useAccount';
import { useDelegateAddressMap } from 'modules/delegates/hooks/useDelegateAddressMap';
import { useVoteProxyAddress } from 'modules/app/hooks/useVoteProxyAddress';
import { limitString } from 'lib/string';
import EtherscanLink from 'modules/web3/components/EtherscanLink';

type PropTypes = {
  address: string;
  showExternalLink?: boolean;
  width?: number;
  limitTextLength?: number;
};

export default function AddressIconBox({
  address,
  showExternalLink,
  width = 41,
  limitTextLength = 0
}: PropTypes): React.ReactElement {
  const { network } = useWeb3();

  const { account, voteProxyContractAddress, voteDelegateContractAddress } = useAccount();
  const { data: delegateAddresses } = useDelegateAddressMap();
  const { data: voteProxyInfo } = useVoteProxyAddress(address);
  // isOwner if the delegateAddress registered in the comment is the same one from the current user
  // isOwner also if the address is equal to the current account address
  const isOwner =
    (voteProxyInfo?.voteProxyAddress &&
      voteProxyInfo?.voteProxyAddress?.toLowerCase() === voteProxyContractAddress?.toLowerCase()) ||
    (delegateAddresses[address] &&
      delegateAddresses[address].voteDelegateAddress?.toLowerCase() ===
        voteDelegateContractAddress?.toLowerCase()) ||
    address.toLowerCase() === account?.toLowerCase();

  const tooltipLabel = voteProxyInfo ? (
    <Box sx={{ p: 2 }}>
      <Text as="p">
        <Text sx={{ fontWeight: 'bold' }}>Contract:</Text> {voteProxyInfo.voteProxyAddress}
      </Text>
      <Text as="p">
        <Text sx={{ fontWeight: 'bold' }}>Hot:</Text> {voteProxyInfo.hotAddress}
      </Text>
      <Text as="p">
        <Text sx={{ fontWeight: 'bold' }}>Cold:</Text> {voteProxyInfo.coldAddress}
      </Text>
    </Box>
  ) : null;

  return (
    <Flex>
      <Flex sx={{ minWidth: width, mr: 2, alignItems: 'center' }}>
        <AddressIcon address={address} width={width} />
      </Flex>
      <Flex
        sx={{
          width: '100%',
          flexDirection: 'column',
          justifyContent: 'center'
        }}
      >
        <Flex sx={{ flexDirection: ['column', 'row'] }}>
          <Flex sx={{ alignItems: 'center' }}>
            {delegateAddresses[address] ? (
              <Text>
                {limitTextLength
                  ? limitString(delegateAddresses[address].name, limitTextLength, '...')
                  : delegateAddresses[address].name}
              </Text>
            ) : (
              <Text>
                <Address address={address} maxLength={limitTextLength} />
              </Text>
            )}
            {showExternalLink && (
              <EtherscanLink
                showBlockExplorerName={false}
                prefix=""
                type="address"
                network={network}
                hash={address}
              />
            )}
          </Flex>
          {isOwner && (
            <Flex
              sx={{
                display: 'inline-flex',
                alignItems: 'center',
                color: 'tagColorSeven',
                ml: [0, 2],
                mt: [1, 0],
                minWidth: '54px'
              }}
            >
              <Text
                sx={{
                  fontSize: 1,
                  backgroundColor: 'tagColorSevenBg',
                  borderRadius: 'roundish',
                  px: 2,
                  py: 1
                }}
              >
                Owner
              </Text>
            </Flex>
          )}
        </Flex>
        {voteProxyInfo && voteProxyInfo.voteProxyAddress && (
          <Flex sx={{ alignItems: 'center' }}>
            <Text sx={{ color: 'textSecondary', fontSize: 1 }}>Proxy Contract</Text>
            <Tooltip label={tooltipLabel}>
              <Flex>
                <Icon name="question" ml={2} />
              </Flex>
            </Tooltip>
          </Flex>
        )}
      </Flex>
    </Flex>
  );
}
