/** @jsx jsx */

import { Box, Text, Flex, jsx, useThemeUI } from 'theme-ui';
import { Delegate } from '../types';
import { MenuItem } from '@reach/menu-button';

import {
  CartesianGrid,
  Legend,
  Line,
  Area,
  LineChart,
  AreaChart,
  ReferenceLine,
  Tooltip,
  XAxis,
  YAxis,
  ResponsiveContainer
} from 'recharts';
import FilterButton from 'components/FilterButton';
import { useState } from 'react';

export function DelegateMKRChart({ delegate }: { delegate: Delegate }): React.ReactElement {
  const { theme } = useThemeUI();

  const data = [{
    date: 'Jan',
    mkr: 4000,
    averageMKRDelegated: 2400,
  },
  {
    date: 'Feb',
    mkr: 3600,
    averageMKRDelegated: 2000,
  },
  {
    date: 'March',
    mkr: 3000,
    averageMKRDelegated: 2400,
  }, {
    date: 'April',
    mkr: 3100,
    averageMKRDelegated: 2000,
  }, {
    date: 'May',
    mkr: 4000,
    averageMKRDelegated: 3000,
  }, {
    date: 'Jun',
    mkr: 4500,
    averageMKRDelegated: 3500,
  }, {
    date: 'Aug',
    mkr: 3000,
    averageMKRDelegated: 5000,
  }, {
    date: 'Sept',
    mkr: 7000,
    averageMKRDelegated: 20000,
  }, {
    date: 'Dec',
    mkr: 10000,
    averageMKRDelegated: 25000,
  }];

  function renderTooltip(item) {
    const monthMKR = data.find(i => i.date === item.label);
    return <Box>
      <Text as="p">{monthMKR?.date}</Text>
      <Text as="p">MKR Weight: {monthMKR?.mkr}</Text>
      <Text as="p">Average MKR delegated: {monthMKR?.averageMKRDelegated}</Text>
    </Box>;
  }

  // Time frames
  const oneDay = 24 * 60 * 60 * 1000;
  const oneYear = 365 * oneDay;
  const oneMonth = 31 * oneDay;
  const oneWeek = 7 * oneDay;

  const timeFrames = [{
    label: 'Last year',
    from: Date.now() - oneYear,
    groupBy: 'month'
  },
  {
    label: 'Last month',
    from: Date.now() - oneMonth,
    groupBy: 'day',
  }, {
    label: 'Last week',
    from: Date.now() - oneWeek,
    groupBy: 'day'
  }];

  const [selectedTimeFrame, setSelectedTimeframe] = useState(timeFrames[0]);


  return (
    <Box>
      <Flex mb={4} mt={4} sx={{
        justifyContent: 'space-between'
      }}>
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
          <Text as="p"  variant="secondary" color="onSurface">Total voting weight over time</Text>
        </Box>
        <Box>
          <FilterButton
            name={() => `${selectedTimeFrame.label}`}
            listVariant="menubuttons.default.list"
          >
            {timeFrames.map(i => {
              return (
                <MenuItem
                  onSelect={() => setSelectedTimeframe(i)}
                  key={i.label}
                  sx={{
                    variant: 'menubuttons.default.item'
                  }}
                >
                  {i.label}
                </MenuItem>);
            })}
          </FilterButton>
        </Box>
      </Flex>
      <ResponsiveContainer
        width={'100%'}
        height={400}>
        <AreaChart
          data={data}
          margin={{ bottom: 66, left: 20, right: 72, top: 10 }}
        >

          <defs>
            <linearGradient id="gradientFront" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#1AAB9B" stopOpacity={0.8} />
              <stop offset="95%" stopColor="#FFFF" stopOpacity={0} />
            </linearGradient>
          </defs>

          <XAxis
            dataKey="date"
            interval="preserveStartEnd"
            stroke={'#ADADAD'}
            color="#ADADAD"
            tickMargin={15}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            dataKey="mkr"
            interval="preserveStartEnd"
            axisLine={false}
            stroke="#ADADAD"
            tickLine={false}
            label={{
              fill: '#708390',
              position: 'bottomLeft',
              value: 'MKR',
              viewBox: { height: 10, width: 10, x: 20, y: 300 },
            }}
            tickMargin={5}

          />

          <CartesianGrid stroke="#eee" strokeDasharray="5 5" />
          <Tooltip content={renderTooltip} />


          <Area
            activeDot={false}
            dataKey="averageMKRDelegated"
            dot={false}
            stroke={'#D4D9E1'}
            fill='transparent'
            type="monotone"
          />

          <Area
            dataKey="mkr"
            stroke={'#1AAB9B'}
            type="monotone"
            dot={{ stroke: '#1AAB9B', strokeWidth: 2 }}
            fill="url(#gradientFront)"
          />

          <ReferenceLine stroke={'#D4D9E1'} x={0} y={0} />
        </AreaChart>
      </ResponsiveContainer>
      <Box sx={{
        display: 'flex',
        margin: '0 auto',
        justifyContent: 'space-around',
      }}>
        <Box sx={{ display: 'flex', alignItems: 'center', paddingLeft: '30px', paddingRight: '30px'}}>
          <Box style={{
            width: '23px',
            height: '2px',
            background: theme.colors?.primary as string,
            marginRight: '8px'
          }}/>
          <Text  variant="secondary" color="onSurface">
            Voting weight of this delegate
          </Text>
        </Box>

        <Box sx={{ display: 'flex', alignItems: 'center'}}>
          <Box style={{
            width: '23px',
            height: '2px',
            background: theme.colors?.secondary as string,
            marginRight: '8px'
          }}/>
          <Text variant="secondary" color="onSurface">
            Average voting weight of all delegates
          </Text>
        </Box>
      </Box>
    </Box>
  );
}