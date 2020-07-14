import { useState } from 'react';
import { Text, Flex } from 'theme-ui';
import { Icon } from '@makerdao/dai-ui-icons';

import useInterval from '../lib/useInterval';

type Props = {
  endDate: string;
  endText: string;
};

const pad = (val: number): string => val < 10 ? '0' + val : String(val);

const CountdownTimer = ({ endDate, endText }: Props) => {
  let [timeLeft, setTimeLeft] = useState(
    Math.floor(new Date(endDate).getTime() / 1000) - Math.floor(new Date().getTime() / 1000)
  );
  useInterval(() => {
    setTimeLeft(_endDate => _endDate - 1);
  }, 1000);

  // const days = Math.floor(timeLeft / (3600 * 24));
  // timeLeft -= days * 3600 * 24;
  const hours = Math.floor(timeLeft / 3600);
  timeLeft -= hours * 3600;
  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft - minutes * 60;

  return (
    <Flex sx={{ alignItems: 'center' }}>
      {timeLeft <= 0 ? (
        <>
          <Icon mr="1" name="clock" size="3" sx={{ color: 'secondary' }} />
          <Text sx={{ fontSize: 2, textTransform: 'uppercase', color: 'secondary' }}>{endText}</Text>
        </>
      ) : (
        <>
          <Icon mr="1" name="clock" size="3" sx={{ color: 'primary' }} />
          <Text sx={{ fontSize: 2, textTransform: 'uppercase', color: 'mutedAlt' }}>
            {hours}:{pad(minutes)}:{pad(seconds)} Remaining
          </Text>
        </>
      )}
    </Flex>
  );
};

export default CountdownTimer;
