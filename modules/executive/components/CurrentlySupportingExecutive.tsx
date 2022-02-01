import { Divider, Box, Text, Flex } from 'theme-ui';
import { CMSProposal } from 'modules/executive/types';

export function CurrentlySupportingExecutive({
  proposalsSupported,
  execSupported
}: {
  proposalsSupported: number;
  execSupported: CMSProposal | undefined;
}): React.ReactElement | null {
  const getSupportText = (): string | null => {
    if (proposalsSupported === 0) {
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
