import { ExternalLink } from './ExternalLink';
import { Box, Text } from 'theme-ui';
export const SkyUpgradeToastContent = (): JSX.Element => {
  return (
    <Box sx={{ p: 2 }}>
      <Text>
        Welcome to the Sky Governance Voting Portal, the only place to vote with SKY. You can no longer vote
        with MKR. The{' '}
        <ExternalLink
          href="https://vote.makerdao.com"
          title="MakerDAO Governance Portal"
          styles={{ textDecoration: 'underline', margin: '0 3px' }}
        >
          <>vote.makerdao.com</>
        </ExternalLink>{' '}
        portal remains active so that you can safely withdraw your MKR, un-delegate voting power, and browse
        old governance data.
      </Text>
    </Box>
  );
};
