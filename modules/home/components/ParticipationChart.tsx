import { Box, Text, useThemeUI, get } from 'theme-ui';
import { Tooltip, XAxis, YAxis, ResponsiveContainer, Legend, AreaChart, Area } from 'recharts';
import { format, sub } from 'date-fns';
import { commify } from 'ethers/lib/utils';
import { AllLocksResponse } from '../types/participation';

const getPastMonths = (numMonths: number): string[] => {
  const pastMonths: string[] = [];
  const now = new Date();

  while (numMonths > 0) {
    pastMonths.push(format(sub(now, { months: numMonths }), 'M'));
    numMonths--;
  }
  return pastMonths;
};

const ParticipationChart = ({
  data,
  monthsPast
}: {
  data: AllLocksResponse[];
  monthsPast: number;
}): React.ReactElement => {
  const { theme } = useThemeUI();

  const months = getPastMonths(monthsPast);

  const range = months.map(m => {
    const myMonth = data.filter(({ month }) => month === m);
    const lastDay = myMonth[myMonth.length - 1];

    return {
      total: lastDay.total,
      blockTimestamp: lastDay.blockTimestamp,
      unixDate: lastDay.unixDate,
      lockTotal: lastDay.lockTotal
    };
  });

  const formatYAxis = tickMkr => tickMkr.toFixed(0);

  const formatXAxis = tickDate => {
    const tickMonth = range.find(({ unixDate }) => unixDate === tickDate);
    return tickMonth ? format(new Date(tickMonth.blockTimestamp), 'LLL') : 'd';
  };

  const renderTooltip = item => {
    const monthMKR = range ? range.find(i => i.unixDate === item.label) : null;
    return (
      <Box>
        {monthMKR && <Text as="p">{format(new Date(monthMKR.blockTimestamp), 'LLL yyyy')}</Text>}
        {monthMKR && <Text as="p">{commify(parseInt(monthMKR.lockTotal).toFixed(0))} MKR</Text>}
      </Box>
    );
  };

  const formatLegend = () => <span sx={{ color: 'onSurface' }}>MKR Locked in Chief</span>;

  return (
    <ResponsiveContainer width={'100%'} minHeight={200}>
      <AreaChart data={range || []}>
        <defs>
          <linearGradient id="gradientFront" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor={get(theme, 'colors.primary')} stopOpacity={0.075} />
            <stop offset="95%" stopColor={get(theme, 'colors.primary')} stopOpacity={0} />
          </linearGradient>
        </defs>

        <Area
          dataKey="total"
          stroke={get(theme, 'colors.primary')}
          type="natural"
          fill="url(#gradientFront)"
          dot={{ stroke: get(theme, 'colors.primary'), strokeWidth: 1.5 }}
        />

        <YAxis
          interval="preserveEnd"
          axisLine={false}
          padding={{ top: 20, bottom: 20 }}
          stroke={'#ADADAD'}
          tickLine={false}
          tickFormatter={formatYAxis}
          label={{
            fill: get(theme, 'colors.onSurface'),
            position: 'bottom',
            value: 'MKR',
            offset: 9
          }}
          domain={['dataMin', 'dataMax']}
        />

        <XAxis
          dataKey="unixDate"
          allowDecimals={true}
          interval="preserveEnd"
          tickCount={0}
          tickLine={false}
          stroke={'#ADADAD'}
          padding={{ left: 20, right: 20 }}
          color="#ADADAD"
          tickFormatter={formatXAxis}
          type="number"
          domain={['dataMin', 'dataMax']}
        />
        <Tooltip content={renderTooltip} />

        <Legend formatter={formatLegend} iconType="plainline" />
      </AreaChart>
    </ResponsiveContainer>
  );
};

export default ParticipationChart;
