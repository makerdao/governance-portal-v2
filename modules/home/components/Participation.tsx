import BigNumber from 'bignumber.js';
import { Box, Text, Flex, Button, Heading, Container, Divider, Card } from 'theme-ui';
import { InternalLink } from 'modules/app/components/InternalLink';
import Stack from 'modules/app/components/layout/layouts/Stack';
import { ViewMore } from './ViewMore';
import { Tooltip, XAxis, YAxis, ResponsiveContainer, LineChart, Line, Legend } from 'recharts';
import useSWR from 'swr';
import { fetchJson } from 'lib/fetchJson';
import { format } from 'date-fns';
import { commify } from 'ethers/lib/utils';

const Chart = ({ data }) => {
  const months = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];
  const newRange = months.map(m => {
    const myMonth = data.filter(({ month }) => parseInt(month) === m);
    const lastDay = myMonth[myMonth.length - 1];
    return { total: lastDay.total, unixDate: m, monthName: format(new Date(lastDay.blockTimestamp), 'LLL') };
  });

  function renderTooltip(item) {
    const monthMKR = newRange ? newRange.find(i => i.unixDate === item.label) : null;

    if (!data) {
      return null;
    }

    return (
      <Box>
        {monthMKR && <Text as="p">{monthMKR.monthName}</Text>}
        <Text as="p">MKR Weight: {new BigNumber(monthMKR?.total).toFormat(2)}</Text>
      </Box>
    );
  }

  const formatXAxis = tickItem => {
    // Sometimes the tickItem is "auto", ignore this case
    if (tickItem === 'auto') {
      return 'auto';
    }

    const d = newRange.find(({ unixDate }) => unixDate === tickItem);
    return d?.monthName || '';
  };

  const formatYAxis = tickItem => {
    return commify(tickItem.toFixed(0));
  };

  const formatLegend = (value, entry, index) => {
    return 'MKR Locked in Chief';
  };

  return (
    <ResponsiveContainer width={'100%'} height={400}>
      <LineChart data={newRange || []}>
        <defs>
          <linearGradient id="gradientFront" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#1AAB9B" stopOpacity={0.8} />
            <stop offset="95%" stopColor="#1AAB9B" stopOpacity={0} />
          </linearGradient>
        </defs>

        <YAxis
          // dataKey="total"
          interval="preserveStartEnd"
          axisLine={false}
          tickLine={true}
          tickFormatter={formatYAxis}
          tickMargin={-10}
          label={{
            fill: '#708390',
            position: 'bottomLeft',
            value: 'MKR',
            viewBox: { height: 10, width: 10, x: 20, y: 300 }
          }}
          domain={['dataMin', 'dataMax']}
        />

        <XAxis
          dataKey="unixDate"
          stroke={'#ADADAD'}
          color="#ADADAD"
          tick={true}
          tickCount={12}
          tickFormatter={formatXAxis}
          type="number"
          domain={['dataMin', 'dataMax']}
        />

        <Tooltip content={renderTooltip} />

        <Line type="monotone" dataKey="total" stroke="#A5A6A8" />
        <Legend formatter={formatLegend} />
      </LineChart>
    </ResponsiveContainer>
  );
};

export default function Participation(): React.ReactElement {
  const unixtimeStart = 1617931199;
  const unixtimeEnd = 1649435010;

  const { data: locks } = useSWR(
    `/api/executive/all-locks?unixtimeStart=${unixtimeStart}&unixtimeEnd=${unixtimeEnd}`,
    fetchJson
  );

  return (
    <Flex sx={{ flexDirection: 'column' }}>
      <Container sx={{ textAlign: 'center', maxWidth: 'title', mb: 4 }}>
        <Stack gap={2}>
          <Heading as="h2">Follow the Conversation and Participate</Heading>
          <Text as="p" sx={{ color: 'textSecondary', px: 'inherit', fontSize: [2, 4] }}>
            Engage with the Maker Community and make informed decisions.
          </Text>
        </Stack>
      </Container>
      <Flex sx={{ flexDirection: 'column' }}>
        <Flex sx={{ justifyContent: 'space-between' }}>
          <Heading>Relevant Forum Posts</Heading>
          <InternalLink href="/delegates" title="View All Delegates">
            <ViewMore label="View All" />
          </InternalLink>
        </Flex>
        {['hi'].map(x => {
          return (
            <Card key={x} sx={{ width: 8 }}>
              hello
            </Card>
          );
        })}
      </Flex>
      {/* container for gov participation and top voter */}
      <Flex sx={{ justifyContent: 'space-between', gap: 3, flexWrap: 'wrap' }}>
        {/* governance participation */}
        <Flex sx={{ flexDirection: 'column', flex: 2 }}>
          <Flex sx={{ justifyContent: 'space-between' }}>
            <Heading>Governance Participation</Heading>
          </Flex>
          {locks && (
            <Flex
              sx={{
                border: 'light',
                borderRadius: 'medium',
                borderColor: 'secondaryMuted',
                p: 3
              }}
            >
              <Chart data={locks} />
            </Flex>
          )}
        </Flex>

        {/* top voters */}
        <Flex sx={{ flexDirection: 'column', flex: 1 }}>
          <Flex sx={{ justifyContent: 'space-between' }}>
            <Heading>Top Voters</Heading>
            <InternalLink href="/delegates" title="View All Delegates">
              <ViewMore label="View All" />
            </InternalLink>
          </Flex>
          <Flex
            sx={{
              border: 'light',
              borderRadius: 'medium',
              borderColor: 'secondaryMuted'
            }}
          >
            stuff
          </Flex>
        </Flex>
      </Flex>
    </Flex>
  );
}
