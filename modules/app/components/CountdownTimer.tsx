/*

SPDX-FileCopyrightText: © 2023 Dai Foundation <www.daifoundation.org>

SPDX-License-Identifier: AGPL-3.0-or-later

*/

import { useState, useEffect } from 'react';
import { Text, Flex, ThemeUIStyleObject } from 'theme-ui';
import Icon from './Icon';

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
  const endTime = Math.floor(new Date(endDate).getTime() / 1000);
  const [text, setText] = useState('');

  useEffect(() => {
    setText(generateText(endTime, endText));

    const interval = setInterval(() => {
      const newText = generateText(endTime, endText);
      if (newText !== text) setText(newText);
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  return (
    <Flex
      data-testid="countdown timer"
      sx={{ alignItems: 'center', flexDirection: 'row', flexWrap: 'nowrap' }}
      {...props}
    >
      <Icon name="clock" size={3} sx={{ mr: 1, color: text !== endText ? 'primary' : 'secondary' }} />
      <TooltipComponent label={formatDateWithTime(endDate)}>
        <Text variant="caps" color={text !== endText ? 'textSecondary' : 'secondary'}>
          {text}
        </Text>
      </TooltipComponent>
    </Flex>
  );
};

export default CountdownTimer;
