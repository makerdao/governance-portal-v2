import BigNumber from 'bignumber.js';
import { Box, Text, Flex, Button, Heading, Container, Divider, Card } from 'theme-ui';
import { InternalLink } from 'modules/app/components/InternalLink';
import Stack from 'modules/app/components/layout/layouts/Stack';
import { ViewMore } from './ViewMore';
// import { formatDelegationHistory } from '../helpers/formatDelegationHistory';
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
import useSWR from 'swr';
import { fetchJson } from 'lib/fetchJson';

// const mockData = [
//   { unixDate: new Date('2019-05-06T14:44:03+00:00').getTime() / 1000, total: 100 },
//   { unixDate: new Date('2019-05-07T14:44:03+00:00').getTime() / 1000, total: 10 },
//   { unixDate: new Date('2019-05-08T14:44:03+00:00').getTime() / 1000, total: 777 }
// ];

// const myStart = 1557103719; //first lock ever
const myStart = 1633742399; // 6 months ago
const myEnd = 1557362919;

const Chart = ({ data }) => {
  return (
    <ResponsiveContainer width={'100%'} height={400}>
      <AreaChart data={data || []} margin={{ bottom: 66, left: 20, right: 20, top: 10 }}>
        <defs>
          <linearGradient id="gradientFront" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#1AAB9B" stopOpacity={0.8} />
            <stop offset="95%" stopColor="#1AAB9B" stopOpacity={0} />
          </linearGradient>
        </defs>

        <XAxis
          // dataKey="date"
          dataKey="unixDate"
          // allowDataOverflow={true} //data overflow thing?
          stroke={'#ADADAD'}
          color="#ADADAD"
          //
          // tick={{ stroke: 'red', strokeWidth: 2 }}
          tick={false}
          tickMargin={15}
          tickLine={false}
          tickCount={20}
          // tickFormatter={formatXAxis}
          // axisLine={true}
          angle={-90}
          // allowDecimals={false} //probably doesnt matter
          // scale="linear"
          ///
          // interval="preserveStartEnd"
          interval={25}
          type="number"
          domain={[myStart, myEnd]}
        />

        <YAxis
          dataKey="total"
          // dataKey="MKR"
          interval="preserveStartEnd"
          axisLine={true}
          stroke="#ADADAD"
          tickLine={true}
          // tickFormatter={formatYAxis}
          label={{
            fill: '#708390',
            position: 'bottomLeft',
            value: 'MKR',
            viewBox: { height: 10, width: 10, x: 20, y: 300 }
          }}
          tickMargin={5}
        />

        <CartesianGrid stroke="#D5D9E0" strokeDasharray="5 5" />
        {/* <Tooltip content={renderTooltip} /> */}

        {/* <Area
      activeDot={false}
      dataKey="averageMKRDelegated"
      dot={false}
      stroke={'#D4D9E1'}
      fill="transparent"
      type="monotone"
    /> */}

        <Area
          dataKey="total"
          stroke={'#1AAB9B'}
          type="stepAfter"
          // dot={{ stroke: '#1AAB9B', strokeWidth: 2 }}
          fill="url(#gradientFront)"
          // legendType="diamond"
          // connectNulls={true}
          // label={{ fill: 'red', fontSize: 20 }}
          dot={{ stroke: 'blue', strokeWidth: 2 }}
          activeDot={{ stroke: 'red', strokeWidth: 2, r: 10 }}
        />

        {/* <ReferenceLine stroke={'#D4D9E1'} x={0} y={0} /> */}
      </AreaChart>
    </ResponsiveContainer>
  );
};

export default function Participation(): React.ReactElement {
  // const { trackButtonClick } = useAnalytics(ANALYTICS_PAGES.TOP_DELEGATES);

  // const { account } = useAccount();
  // const [showDelegateModal, setShowDelegateModal] = useState<Delegate | null>(null);
  // const [toggledDelegates, setToggledDelegates] = useState({});

  const dataraw = useSWR('/api/executive/all-locks', fetchJson);
  console.log('^^^data', dataraw);

  const locks = dataraw?.data?.allLocksSummed?.nodes.map((x, i) => {
    x.unixDate = new Date(x.blockTimestamp).getTime() / 1000;
    x.total = new BigNumber(x.lockTotal).toNumber();
    return x;
    // x['MKR'] = new BigNumber(x.lockTotal).toNumber();
  });

  console.log('locks', locks);

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
      <Flex sx={{ width: '100%', justifyContent: 'space-between', gap: 3 }}>
        {/* governance participation */}
        <Flex sx={{ flexDirection: 'column', flex: 2 }}>
          <Flex sx={{ justifyContent: 'space-between' }}>
            <Heading>Governance Participation</Heading>
          </Flex>
          <Flex
            sx={{
              border: 'light',
              borderRadius: 'medium',
              borderColor: 'secondaryMuted'
            }}
          >
            <Chart data={locks || []} />
          </Flex>
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
