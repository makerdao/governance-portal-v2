/** @jsx jsx */

import { Box, Text, jsx } from 'theme-ui';
import { Delegate } from '../types';
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

export function DelegateMKRChart({ delegate }: { delegate: Delegate }): React.ReactElement {
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

  return (
    <Box>
      <Box mb={4} mt={4}>
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
        <Text as="p" variant="secondary">Total voting weight over time</Text>
      </Box>
      <ResponsiveContainer width={882} height={400}><AreaChart
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
      </AreaChart></ResponsiveContainer>
    </Box>
  );
}