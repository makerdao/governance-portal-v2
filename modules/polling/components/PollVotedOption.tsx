import { BigNumber } from 'ethers';
import { formatValue } from 'lib/string';
import { getNumberWithOrdinal } from 'lib/utils';
import { getEtherscanLink } from 'modules/web3/helpers/getEtherscanLink';
import { Box, Button, Flex, Text, Link as ThemeUILink } from 'theme-ui';
import { getVoteColor } from '../helpers/getVoteColor';
import { Poll } from '../types';
import { Icon } from '@makerdao/dai-ui-icons';
import { useWeb3 } from 'modules/web3/hooks/useWeb3';
import InternalIcon from 'modules/app/components/Icon';
import { isInputFormatSingleChoice } from '../helpers/utils';

export default function PollVotedOption({
  poll,
  votedOption,
  toggleShareModal,
  votingWeight,
  transactionHash
}: {
  poll: Poll;
  votedOption: number | number[];
  toggleShareModal: (pollId?: number) => void;
  transactionHash: string;
  votingWeight?: BigNumber;
}): React.ReactElement {
  const { network } = useWeb3();

  return (
    <Box>
      <Box>
        <Text
          as="p"
          variant="caps"
          color="textSecondary"
          sx={{ textAlign: ['left', 'right'], mb: 1, fontSize: ['10px', 1] }}
        >
          Your voted option
        </Text>
        {isInputFormatSingleChoice(poll.parameters) ? (
          <Flex sx={{ justifyContent: ['flex-start', 'flex-end'] }}>
            <Text
              sx={{
                color: getVoteColor(votedOption as number, poll.parameters),
                fontWeight: 'semiBold',
                fontSize: 2
              }}
            >
              {poll.options[votedOption as number]}
            </Text>
            {votingWeight && (
              <Text color="onSecondary" sx={{ fontSize: 2 }}>
                &nbsp;with {votingWeight ? `${formatValue(votingWeight)} MKR` : '--'}
              </Text>
            )}
          </Flex>
        ) : (
          (votedOption as number[]).map((id, index) => (
            <Flex sx={{ mb: 1, textAlign: ['left', 'right'] }} key={id}>
              <Flex sx={{ flexDirection: 'column' }}>
                <Text sx={{ variant: 'text.caps', fontSize: 1 }}>
                  {getNumberWithOrdinal(index + 1)} choice
                </Text>
                <Text data-testid="choice" sx={{ fontWeight: 'semiBold', fontSize: 2 }}>
                  {poll.options[id]}
                </Text>
              </Flex>
            </Flex>
          ))
        )}

        <Flex
          sx={{
            justifyContent: ['flex-start', 'flex-end'],
            lineHeight: '20px',
            mb: 3
          }}
        >
          <ThemeUILink
            href={getEtherscanLink(network, transactionHash as string, 'transaction')}
            target="_blank"
            title="View on Etherscan"
            sx={{
              textAlign: ['left', 'right']
            }}
          >
            <Text sx={{ fontSize: 1 }}>View on Etherscan</Text>
            <Icon name="arrowTopRight" size={2} ml={1} />
          </ThemeUILink>
        </Flex>

        <Flex
          sx={{
            textAlign: ['left', 'right']
          }}
        >
          <Button
            variant="primaryOutline"
            sx={{ width: ['100%', '250px'] }}
            mb={2}
            onClick={() => toggleShareModal(poll.pollId)}
          >
            <Flex sx={{ alignItems: 'center', justifyContent: 'center' }}>
              <InternalIcon name="forum" size={18} /> <Text ml={1}>Share this vote</Text>
            </Flex>
          </Button>
        </Flex>
      </Box>
    </Box>
  );
}
