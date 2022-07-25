import { Box } from 'theme-ui';
import { Poll } from 'modules/polling/types';
import { useAnalytics } from 'modules/app/client/analytics/useAnalytics';
import { ANALYTICS_PAGES } from 'modules/app/client/analytics/analytics.constants';
import { SubmitBallotButtonAndModals } from '../SubmitBallotButtonAndModals';
import ActivePollsBox from './ActivePollsBox';

export default function ReviewBox({
  activePolls,
  polls,
  ...props
}: {
  activePolls: Poll[];
  polls: Poll[];
}): JSX.Element {
  const { trackButtonClick } = useAnalytics(ANALYTICS_PAGES.POLLING_REVIEW);

  const Default = props => (
    <ActivePollsBox polls={polls} activePolls={activePolls} {...props}>
      <SubmitBallotButtonAndModals
        onSubmit={() => {
          trackButtonClick('submitBallot');
        }}
      />
    </ActivePollsBox>
  );

  return (
    <Box {...props}>
      <Default />
    </Box>
  );
}
