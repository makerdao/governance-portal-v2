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
import FilterButton from 'modules/app/components/FilterButton';
import { useEffect, useState } from 'react';
import { MKRWeightTimeRanges } from '../delegates.constants';
import { fetchJson } from '@ethersproject/web';
import useSWR from 'swr';
import { getNetwork } from 'lib/maker';
import { format } from 'date-fns';

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
  const { data, error, isValidating, revalidate } = useSWR(
    `/api/delegates/mkr-weight-history/${delegate.voteDelegateAddress}?network=${getNetwork()}&from=${
      selectedTimeFrame.from
    }&range=${selectedTimeFrame.range}`,
    fetchJson
  );

  useEffect(() => {
    revalidate();
  }, [selectedTimeFrame]);

  function renderTooltip(item) {
    const monthMKR = data ? data.find(i => i.date === item.label) : null;

    if (!data) {
      return null;
    }

    return (
      <Box>
        {monthMKR && <Text as="p">{formatXAxis(monthMKR.date)}</Text>}
        <Text as="p">MKR Weight: {monthMKR?.MKR}</Text>
        <Text as="p">Average MKR delegated: {monthMKR?.averageMKRDelegated}</Text>
      </Box>
    );
  }

  const formatXAxis = tickItem => format(new Date(tickItem), dateFormat);

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
            Total voting weight over time
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
        <AreaChart data={data || []} margin={{ bottom: 66, left: 20, right: 72, top: 10 }}>
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
            interval={selectedTimeFrame.interval}
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
          />

          <CartesianGrid stroke="#D5D9E0" strokeDasharray="5 5" />
          <Tooltip content={renderTooltip} />

          {/* <Area
            activeDot={false}
            dataKey="averageMKRDelegated"
            dot={false}
            stroke={'#D4D9E1'}
            fill="transparent"
            type="monotone"
          /> */}

          <Area
            dataKey="MKR"
            stroke={'#1AAB9B'}
            type="monotone"
            // dot={{ stroke: '#1AAB9B', strokeWidth: 2 }}
            fill="url(#gradientFront)"
          />

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
            Voting weight of this delegate
          </Text>
        </Box>

        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <Box
            style={{
              width: '23px',
              height: '2px',
              background: theme.colors?.secondary as string,
              marginRight: '8px'
            }}
          />
          <Text variant="secondary" color="onSurface">
            Average voting weight of all delegates
          </Text>
        </Box>
      </Box>
    </Box>
  );
}
