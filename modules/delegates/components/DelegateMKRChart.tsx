import { Box } from '@theme-ui/components';
import { Delegate } from '../types';
import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ReferenceLine,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';

export function DelegateMKRChart({ delegate }: { delegate: Delegate }): React.ReactElement {
  const data = [{
    date: '21 June',
    mkr: 4000,
    averageMKRDelegated: 2400,
  },
  {
    date: '22 June',
    mkr: 3600,
    averageMKRDelegated: 2000,
  },
  {
    date: '23 June',
    mkr: 3000,
    averageMKRDelegated: 2400,
  }, {
    date: '24 June',
    mkr: 3100,
    averageMKRDelegated: 2000,
  }, {
    date: '25 June',
    mkr: 4000,
    averageMKRDelegated: 3000,
  }, {
    date: '26 June',
    mkr: 4500,
    averageMKRDelegated: 3500,
  }, {
    date: '27 June',
    mkr: 3000,
    averageMKRDelegated: 5000,
  }, {
    date: '28 June',
    mkr: 7000,
    averageMKRDelegated: 20000,
  }, {
    date: '29 June',
    mkr: 10000,
    averageMKRDelegated: 25000,
  }];


  return (
    <Box> <LineChart
      data={data}
      height={400}
      margin={{ bottom: 66, left: 20, right: 72, top: 10 }}
      width={600}

    >
      <XAxis
        dataKey="date"
        interval="preserveStartEnd"
        stroke={'green'}

        tickMargin={40}
        label={{
          angle: 0,
          fill: 'green',
          position: 'bottom',
          value: 'TIME',
          viewBox: { height: 10, width: 10, x: 155, y: 0 },
        }}

      />
      <YAxis
        dataKey="mkr"
        interval="preserveStartEnd"
        label={{
          angle: -90,
          fill: 'blue',
          position: 'left',
          value: 'MKR',
          viewBox: { height: 10, width: 10, x: 55, y: 79 },
        }}
        stroke={'grey'}
        tickLine={false}
        tickMargin={5}

      />

      <CartesianGrid strokeDasharray="3 3" />
      <Tooltip />
      <Legend />
      <Line
        activeDot={false}
        dataKey="mkr"
        dot={false}
        stroke={'blue'}
        type="monotone"
      />

      <Line
        activeDot={false}
        dataKey="averageMKRDelegated"
        dot={false}
        stroke={'green'}
        type="monotone"
      />

      <ReferenceLine stroke="red" strokeDasharray="3 3" x={2} />

    </LineChart>
    </Box>
  );
}