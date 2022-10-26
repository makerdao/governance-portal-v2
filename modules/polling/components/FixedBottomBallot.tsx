import { ANALYTICS_PAGES } from 'modules/app/client/analytics/analytics.constants';
import { useAnalytics } from 'modules/app/client/analytics/useAnalytics';
import { InternalLink } from 'modules/app/components/InternalLink';
import { useContext } from 'react';
import { Box, Button, Flex, Text } from 'theme-ui';
import { BallotContext } from '../context/BallotContext';

export default function FixedBottomBallot() {
  const { ballotCount, clearBallot } = useContext(BallotContext);
  const { trackButtonClick } = useAnalytics(ANALYTICS_PAGES.POLLING);

  if (ballotCount === 0) {
    return null;
  }
  return (
    <Box
      sx={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        background: 'background',
        width: '100%',
        borderTop: '1px solid',
        borderColor: 'secondary',
        
      }}
    >
      <Flex sx={{ alignItems: 'center', justifyContent: 'flex-end', p: 2, flexDirection: ['column', 'row'] , maxWidth: 'dashboard', margin: '0 auto'}}>
        <Text variant="smallCaps" sx={{ mr: [0, 2], mb: [2, 0] }}>
          {ballotCount} poll{ballotCount === 1 ? '' : 's'} added to your ballot{' '}
        </Text>
        <Flex>
          <InternalLink href="/polling/review" title="Review & submit your ballot">
            <Button
              onClick={() => {
                trackButtonClick('reviewAndSubmitBallot');
              }}
              variant="primary"
              disabled={!ballotCount}
              sx={{ cursor: !ballotCount ? 'not-allowed' : 'pointer', mr: 2 }}
            >
              Submit Your Ballot
            </Button>
          </InternalLink>

          {ballotCount > 0 && (
            <Button variant="mutedOutline" sx={{ cursor: 'pointer' }} onClick={clearBallot}>
              Clear Ballot
            </Button>
          )}
        </Flex>
      </Flex>
    </Box>
  );
}
