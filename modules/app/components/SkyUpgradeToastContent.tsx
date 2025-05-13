import { ExternalLink } from './ExternalLink';
import { Box, Text, Flex } from 'theme-ui';
import Icon from 'modules/app/components/Icon';

export const SkyUpgradeToastContent = (): JSX.Element => {
  return (
    <Box
      sx={{
        p: 2
      }}
    >
      <Flex sx={{ alignItems: 'center', mb: 2 }}>
        <Icon name="info" size={24} sx={{ mr: 2, mt: '2px', flexShrink: 0, color: 'primary' }} />
        <Text as="h3" sx={{ fontSize: 2, fontWeight: 'bold', color: 'text' }}>
          Governance Migration Notice
        </Text>
      </Flex>

      <Flex sx={{ alignItems: 'flex-start' }}>
        <Text sx={{ fontSize: 2, color: 'text' }}>
          Welcome to the Sky Governance Voting Portal, the only place to vote with SKY. You can no longer vote
          with MKR. The{' '}
          <ExternalLink
            href="https://vote.makerdao.com"
            title="MakerDAO Governance Portal"
            styles={{ textDecoration: 'underline', margin: '0 3px', color: '#504DFF' }}
          >
            <>vote.makerdao.com</>
          </ExternalLink>{' '}
          portal remains active so that you can safely withdraw your MKR, un-delegate voting power, and browse
          old governance data.
        </Text>
      </Flex>
    </Box>
  );
};
