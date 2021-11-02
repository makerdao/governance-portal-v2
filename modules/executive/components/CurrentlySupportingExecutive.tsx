import { useVotedProposals } from 'modules/executive/hooks/useVotedProposals';
import { Divider, Box, Text, Flex, jsx } from 'theme-ui';
import { CMSProposal } from 'modules/executive/types';
import { useExecutives } from '../hooks/useExecutives';

export function CurrentlySupportingExecutive({ address }: { address: string }): React.ReactElement | null {
  const { data: proposals } = useExecutives();
  const { data: votedProposals } = useVotedProposals(address);

  const proposalsSupported: number = votedProposals?.length;

  const execSupported: CMSProposal | undefined = proposals?.find(proposal =>
    votedProposals?.find(vp => vp.toLowerCase() === proposal?.address?.toLowerCase())
  );

  const getSupportText = (): string | null => {
    if (!proposals || !votedProposals) {
      return 'Fetching executive data';
    }

    if (proposals && votedProposals && !execSupported) {
      return 'Currently no executive supported';
    }

    if (execSupported) {
      return `Currently supporting ${execSupported.title}${
        proposalsSupported > 1
          ? ` & ${proposalsSupported - 1} more proposal${proposalsSupported === 2 ? '' : 's'}`
          : ''
      }`;
    }

    return null;
  };

  const supportText = getSupportText();
  return supportText ? (
    <Box>
      <Divider my={1} />
      <Flex sx={{ py: 2, justifyContent: 'center', fontSize: [1, 2], color: 'onSecondary' }}>
        <Text as="p" sx={{ textAlign: 'center', px: [3, 4], mb: 1, wordBreak: 'break-word' }}>
          {supportText}
        </Text>
      </Flex>
    </Box>
  ) : null;
}
