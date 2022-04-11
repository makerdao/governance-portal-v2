import { Box, Text, Flex, Button, Heading, Container, Divider, Card, useThemeUI, get } from 'theme-ui';
import { InternalLink } from 'modules/app/components/InternalLink';
import Stack from 'modules/app/components/layout/layouts/Stack';
import { ViewMore } from './ViewMore';
import { Tooltip, XAxis, YAxis, ResponsiveContainer, LineChart, Line, Legend } from 'recharts';
import useSWR from 'swr';
import { fetchJson } from 'lib/fetchJson';
import { format, sub } from 'date-fns';
import { commify } from 'ethers/lib/utils';

const getPastMonths = (numMonths: number): string[] => {
  const pastMonths: string[] = [];
  const now = new Date();

  while (numMonths > 0) {
    pastMonths.push(format(sub(now, { months: numMonths }), 'M'));
    numMonths--;
  }
  return pastMonths;
};

const Chart = ({ data }) => {
  const { theme } = useThemeUI();

  const months = getPastMonths(6); // TODO use unix start time from request

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

  const renderTooltip = item => {
    const monthMKR = range ? range.find(i => i.unixDate === item.label) : null;
    return (
      <Box>
        {monthMKR && <Text as="p">{format(new Date(monthMKR.blockTimestamp), 'LLL yyyy')}</Text>}
        {monthMKR && <Text as="p">{commify(parseInt(monthMKR.lockTotal).toFixed(0))} MKR</Text>}
        {monthMKR && <Text as="p">{monthMKR.unixDate} MKR</Text>}
      </Box>
    );
  };

  const formatXAxis = tickDate => {
    const tickMonth = range.find(({ unixDate }) => unixDate === tickDate);
    return tickMonth ? format(new Date(tickMonth.blockTimestamp), 'LLL') : 'd';
  };

  const formatYAxis = tickMkr => tickMkr.toFixed(0);

  const formatLegend = () => <span sx={{ color: 'onSurface' }}>MKR Locked in Chief</span>;

  return (
    <ResponsiveContainer width={'100%'} height={400}>
      <LineChart data={range || []}>
        <defs>
          <linearGradient id="gradientFront" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#1AAB9B" stopOpacity={0.8} />
            <stop offset="95%" stopColor="#1AAB9B" stopOpacity={0} />
          </linearGradient>
        </defs>

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

        <Line type="monotone" dataKey="total" stroke={get(theme, 'colors.primary')} strokeWidth={1.5} />

        <Legend formatter={formatLegend} iconType="plainline" />
      </LineChart>
    </ResponsiveContainer>
  );
};

export default function Participation(): React.ReactElement {
  // This makes sure the timestamp is the same throughout the day so the SWR cache-key doesn't change
  const unixtimeStart = new Date(format(sub(new Date(), { months: 6 }), 'MM-dd-yyyy')).getTime() / 1000;

  const { data: locks } = useSWR(`/api/executive/all-locks?unixtimeStart=${unixtimeStart}`, fetchJson);

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
