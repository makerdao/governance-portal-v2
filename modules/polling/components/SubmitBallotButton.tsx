import { Flex, Button } from 'theme-ui';
import React, { useContext } from 'react';
import { BallotContext } from '../context/BallotContext';

export function SubmitBallotButton(): React.ReactElement {
  const { ballotCount, setStep, ballotStep } = useContext(BallotContext);

  return (
    <Flex p={3} sx={{ flexDirection: 'column', width: '100%', m: '0' }}>
      <Button
        onClick={() => {
          setStep('method-select');
        }}
        data-testid="submit-ballot-button"
        variant="primaryLarge"
        disabled={!ballotCount || ballotStep !== 'initial'}
        sx={{ width: '100%' }}
      >
        Submit Your Ballot ({ballotCount} vote{ballotCount === 1 ? '' : 's'})
      </Button>
    </Flex>
  );
}
