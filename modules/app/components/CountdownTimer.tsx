import { useState } from 'react';
import { Text, Flex, ThemeUIStyleObject } from 'theme-ui';
import { Icon } from '@makerdao/dai-ui-icons';

import useInterval from 'lib/useInterval';
import TooltipComponent from './Tooltip';
import { formatDateWithTime } from 'lib/datetime';

type Props = {
  endDate: Date;
  endText: string;
  sx?: ThemeUIStyleObject;
};

const pad = (val: number): string => (val < 10 ? '0' + val : String(val));

const generateText = (endTime, endText) => {
  const now = Math.floor(new Date().getTime() / 1000);
  let timeLeft = endTime - now;
  if (timeLeft <= 0) return endText;

  const days = Math.floor(timeLeft / 3600 / 24);
  timeLeft -= days * 3600 * 24;
  const hours = Math.floor(timeLeft / 3600);
  timeLeft -= hours * 3600;
  if (days > 0) return `${days}D ${hours}H remaining`;

  const minutes = Math.floor(timeLeft / 60);
  timeLeft -= minutes * 60;
  return `${hours}:${pad(minutes)}:${pad(timeLeft)} remaining`;
};

const CountdownTimer = ({ endDate, endText, ...props }: Props): JSX.Element => {
  let [endTime, setEndTime] = useState<number>(); // eslint-disable-line prefer-const
  let [text, setText] = useState(''); // eslint-disable-line prefer-const

  if (!text) {
    endTime = Math.floor(new Date(endDate).getTime() / 1000);
    setEndTime(endTime);
    text = generateText(endTime, endText);
    setText(text);
  }

  useInterval(() => {
    const newText = generateText(endTime, endText);
    if (newText !== text) setText(newText);
  }, 1000);

  return (
    <Flex
      data-testid="countdown timer"
      sx={{ alignItems: 'center', flexDirection: 'row', flexWrap: 'nowrap' }}
      {...props}
    >
      <Icon mr="1" name="clock" size="3" sx={{ color: text !== endText ? 'primary' : 'secondary' }} />
      <TooltipComponent label={formatDateWithTime(endDate)}>
        <Text variant="caps" color={text !== endText ? 'textSecondary' : 'secondary'}>
          {text}
        </Text>
      </TooltipComponent>
    </Flex>
  );
};

export default CountdownTimer;
