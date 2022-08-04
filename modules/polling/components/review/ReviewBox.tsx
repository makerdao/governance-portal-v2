import { Box } from 'theme-ui';
import { Poll } from 'modules/polling/types';
import { useAnalytics } from 'modules/app/client/analytics/useAnalytics';
import { ANALYTICS_PAGES } from 'modules/app/client/analytics/analytics.constants';
import { BallotModals } from '../BallotModals';
import { SubmitBallotButton } from '../SubmitBallotButton';
import ActivePollsBox from './ActivePollsBox';
import { useContext } from 'react';
import { BallotContext } from '../../context/BallotContext';

export default function ReviewBox({
  activePolls,
  polls,
  ...props
}: {
  activePolls: Poll[];
  polls: Poll[];
}): JSX.Element {
  const { trackButtonClick } = useAnalytics(ANALYTICS_PAGES.POLLING_REVIEW);
  const { ballotStep } = useContext(BallotContext);

  const Default = props => (
    <ActivePollsBox polls={polls} activePolls={activePolls} {...props}>
      <SubmitBallotButton />
      {ballotStep !== 'initial' && (
        <BallotModals
          onSubmit={() => {
            trackButtonClick('submitBallot');
          }}
        />
      )}
    </ActivePollsBox>
  );

  return (
    <Box {...props}>
      <Default />
    </Box>
  );
}
