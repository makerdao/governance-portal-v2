/*

SPDX-FileCopyrightText: © 2023 Dai Foundation <www.daifoundation.org>

SPDX-License-Identifier: AGPL-3.0-or-later

*/

import { Box, Text, Flex, useThemeUI } from 'theme-ui';
import { Delegate } from '../types';
import { MenuItem } from '@reach/menu-button';
import BigNumber from 'lib/bigNumberJs';

import {
  CartesianGrid,
  Area,
  AreaChart,
  ReferenceLine,
  Tooltip,
  XAxis,
  YAxis,
  ResponsiveContainer
} from 'recharts';
import FilterButton from 'modules/app/components/FilterButton';
import { useState } from 'react';
import { MKRWeightTimeRanges } from '../delegates.constants';
import { format } from 'date-fns';
import { formatDelegationHistoryChart } from '../helpers/formatDelegationHistoryChart';

export function DelegateMKRChart({ delegate }: { delegate: Delegate }): React.ReactElement {
  const { theme } = useThemeUI();

  // Time ranges
  const oneDay = 24 * 60 * 60 * 1000;
  const oneYear = 365 * oneDay;
  const oneMonth = 31 * oneDay;
  const oneWeek = 7 * oneDay;

  const dateFormat = 'MM-dd-yyyy';

  const timeRanges = [
    {
      label: 'Last year',
      from: Date.now() - oneYear,
      range: MKRWeightTimeRanges.month,
      interval: 30
    },
    {
      label: 'Last month',
      from: Date.now() - oneMonth,
      range: MKRWeightTimeRanges.day,
      interval: 7
    },
    {
      label: 'Last week',
      from: Date.now() - oneWeek,
      range: MKRWeightTimeRanges.day,
      interval: 1
    }
  ];

  const [selectedTimeFrame, setSelectedTimeframe] = useState(timeRanges[0]);

  const data = formatDelegationHistoryChart(delegate.mkrLockedDelegate, selectedTimeFrame.from);

  function renderTooltip(item) {
    const monthMKR = data ? data.find(i => i.date === item.label) : null;

    if (!data) {
      return null;
    }

    return (
      <Box>
        {monthMKR && <Text as="p">{formatXAxis(monthMKR.date)}</Text>}
        <Text as="p">MKR Weight: {new BigNumber(monthMKR?.MKR || 0).toFormat(2)}</Text>
      </Box>
    );
  }

  const formatXAxis = tickItem => {
    if (tickItem === 'auto') {
      // Sometimes the tickItem is "auto", ignore this case
      return 'auto';
    }
    return format(new Date(tickItem.toISOString()), dateFormat);
  };

  const formatYAxis = tickItem => {
    return tickItem.toLocaleString();
  };

  return (
    <Box>
      <Flex
        mb={4}
        mt={4}
        sx={{
          justifyContent: 'space-between'
        }}
      >
        <Box>
          <Text
            as="p"
            variant="h2"
            sx={{
              fontSize: 4,
              fontWeight: 'semiBold'
            }}
          >
            Voting Weight
          </Text>
          <Text as="p" variant="secondary" color="onSurface">
            MKR delegated over time
          </Text>
        </Box>
        <Box>
          <FilterButton name={() => `${selectedTimeFrame.label}`} listVariant="menubuttons.default.list">
            {timeRanges.map(i => {
              return (
                <MenuItem
                  onSelect={() => setSelectedTimeframe(i)}
                  key={i.label}
                  sx={{
                    variant: 'menubuttons.default.item'
                  }}
                >
                  {i.label}
                </MenuItem>
              );
            })}
          </FilterButton>
        </Box>
      </Flex>
      <ResponsiveContainer width={'100%'} height={400}>
        <AreaChart data={data || []} margin={{ bottom: 66, left: 20, right: 20, top: 10 }}>
          <defs>
            <linearGradient id="gradientFront" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#1AAB9B" stopOpacity={0.8} />
              <stop offset="95%" stopColor="#1AAB9B" stopOpacity={0} />
            </linearGradient>
          </defs>

          <XAxis
            dataKey="date"
            stroke={'#ADADAD'}
            color="#ADADAD"
            tickMargin={15}
            axisLine={false}
            tickLine={false}
            tickFormatter={formatXAxis}
          />
          <YAxis
            dataKey="MKR"
            interval="preserveStartEnd"
            axisLine={false}
            stroke="#ADADAD"
            tickLine={false}
            label={{
              fill: '#708390',
              position: 'bottomLeft',
              value: 'MKR',
              viewBox: { height: 10, width: 10, x: 20, y: 300 }
            }}
            tickMargin={5}
            tickFormatter={formatYAxis}
          />

          <CartesianGrid stroke="#D5D9E0" strokeDasharray="5 5" />
          <Tooltip content={renderTooltip} />

          <Area dataKey="MKR" stroke={'#1AAB9B'} type="monotone" fill="url(#gradientFront)" />

          <ReferenceLine stroke={'#D4D9E1'} x={0} y={0} />
        </AreaChart>
      </ResponsiveContainer>
      <Box
        sx={{
          display: 'flex',
          margin: '0 auto',
          justifyContent: 'space-around'
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', paddingLeft: '30px', paddingRight: '30px' }}>
          <Box
            style={{
              width: '23px',
              height: '2px',
              background: theme.colors?.primary as string,
              marginRight: '8px'
            }}
          />
          <Text variant="secondary" color="onSurface">
            MKR delegated to this delegate
          </Text>
        </Box>
      </Box>
    </Box>
  );
}
