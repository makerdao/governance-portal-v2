import { useState } from 'react';
import { Text, Box, Flex } from 'theme-ui';
import { Icon } from '@makerdao/dai-ui-icons';

import useInterval from '../lib/useInterval';

export default function CountdownTimer({ endDate, endText }) {
  const [_timeLeft, _setTimeLeft] = useState(
    Math.floor(new Date(endDate).getTime() / 1000) -
      Math.floor(new Date().getTime() / 1000)
  );
  useInterval(() => {
    _setTimeLeft(_endDate => _endDate - 1);
  }, 1000);

  let timeLeft = _timeLeft;
  const days = Math.floor(timeLeft / (3600 * 24));
  timeLeft -= days * 3600 * 24;
  const hours = Math.floor(timeLeft / 3600);
  timeLeft -= hours * 3600;
  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft - minutes * 60;

  return (
    <Flex sx={{ alignItems: 'center' }}>
      {_timeLeft <= 0 ? (
        <>
          <Icon mr="1" name="clock" size="3" sx={{ color: '#D4D9E1' }} />
          <Text
            sx={{ fontSize: 2, textTransform: 'uppercase', color: '#D4D9E1' }}
          >
            {endText}
          </Text>
        </>
      ) : (
        <>
          <Icon mr="1" name="clock" size="3" sx={{ color: '#1AAB9B' }} />
          <Text
            sx={{ fontSize: 2, textTransform: 'uppercase', color: '#708390' }}
          >
            {hours}:{minutes}:{seconds} Remaining
          </Text>
        </>
      )}
    </Flex>
  );
}
