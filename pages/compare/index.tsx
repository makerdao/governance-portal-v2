/** @jsx jsx */
import { useEffect } from 'react';
import { Heading, Box, jsx, Flex, NavLink, Button, Text } from 'theme-ui';
import { useBreakpointIndex } from '@theme-ui/match-media';
import ErrorPage from 'next/error';
import Link from 'next/link';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { Icon } from '@makerdao/dai-ui-icons';
import { getNetwork } from 'lib/maker';
import { useAnalytics } from 'lib/client/analytics/useAnalytics';
import { ANALYTICS_PAGES } from 'lib/client/analytics/analytics.constants';
import PrimaryLayout from 'components/layouts/Primary';
import SidebarLayout from 'components/layouts/Sidebar';
import Stack from 'components/layouts/Stack';
import SystemStatsSidebar from 'components/SystemStatsSidebar';
import ResourceBox from 'components/ResourceBox';
import PageLoadingPlaceholder from 'components/PageLoadingPlaceholder';
import { usePollVoteCompare } from 'lib/hooks';

type Props = {
  comparedVoteData: any;
  address1: string;
  address2: string;
};

const CompareView = ({ comparedVoteData, address1, address2 }: Props) => {
  const { trackButtonClick } = useAnalytics(ANALYTICS_PAGES.DELEGATES);
  const network = getNetwork();
  const bpi = useBreakpointIndex({ defaultIndex: 2 });

  return (
    <PrimaryLayout shortenFooter={true} sx={{ maxWidth: [null, null, null, 'page', 'dashboard'] }}>
      <Head>
        <title>Maker Governance - Delegate Vote Compare</title>
      </Head>

      <SidebarLayout>
        <Stack gap={2}>
          <Flex sx={{ alignItems: 'center' }}>
            <Heading variant="microHeading" mr={3}>
              <Link scroll={false} href={{ pathname: '/delegates', query: { network } }}>
                <NavLink p={0}>
                  <Button variant="mutedOutline" onClick={() => trackButtonClick('backToDelegatePage')}>
                    <Flex sx={{ alignItems: 'center', whiteSpace: 'nowrap' }}>
                      <Icon name="chevron_left" size={2} mr={2} />
                      {bpi > 0 ? 'Back to all delegates' : 'Back'}
                    </Flex>
                  </Button>
                </NavLink>
              </Link>
            </Heading>
          </Flex>
          {comparedVoteData ? (
            <Box>
              {comparedVoteData?.map(voteData => (
                <Box key={voteData.pollId} sx={{ mb: 3 }}>
                  <Text as="p">Poll ID: {voteData.pollId}</Text>
                  <Text as="p" sx={{ color: voteData.a1 === voteData.a2 ? 'green' : 'red' }}>
                    {address1}: {voteData.a1}
                  </Text>
                  <Text as="p" sx={{ color: voteData.a1 === voteData.a2 ? 'green' : 'red' }}>
                    {address2}: {voteData.a2}
                  </Text>
                </Box>
              ))}
            </Box>
          ) : (
            <Box>No data to show</Box>
          )}
        </Stack>
        <Stack gap={3}>
          <SystemStatsSidebar
            fields={['polling contract', 'savings rate', 'total dai', 'debt ceiling', 'system surplus']}
          />
          <ResourceBox />
        </Stack>
      </SidebarLayout>
    </PrimaryLayout>
  );
};

export default function CompareAddressPage(): JSX.Element {
  const router = useRouter();

  const { address1, address2 } = router.query;
  // fetch delegates at run-time if on any network other than the default
  // useEffect(() => {
  //   console.log({ address1, address2 });
  // }, [address1, address2]);

  const { data: comparedVoteData, error } = usePollVoteCompare(address1 as string, address2 as string);

  if (error) {
    return <ErrorPage statusCode={404} title="Error fetching delegate" />;
  }

  if (!address1 || !address2) {
    return (
      <PrimaryLayout shortenFooter={true}>
        <PageLoadingPlaceholder />
      </PrimaryLayout>
    );
  }

  return (
    <CompareView
      comparedVoteData={comparedVoteData}
      address1={address1 as string}
      address2={address2 as string}
    />
  );
}
