/** @jsx jsx */
import { useEffect, useState } from 'react';
import { Heading, Box, jsx, Flex, NavLink, Button, Text } from 'theme-ui';
import { useBreakpointIndex } from '@theme-ui/match-media';
import ErrorPage from 'next/error';
import Link from 'next/link';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { Icon } from '@makerdao/dai-ui-icons';
import { getNetwork } from 'lib/maker';
import { fetchJson } from 'lib/utils';
import { useAnalytics } from 'lib/client/analytics/useAnalytics';
import { ANALYTICS_PAGES } from 'lib/client/analytics/analytics.constants';
import PrimaryLayout from 'components/layouts/Primary';
import SidebarLayout from 'components/layouts/Sidebar';
import Stack from 'components/layouts/Stack';
import SystemStatsSidebar from 'components/SystemStatsSidebar';
import ResourceBox from 'components/ResourceBox';
import PageLoadingPlaceholder from 'components/PageLoadingPlaceholder';
import useAccountsStore from 'stores/accounts';
import { usePollVoteCompare } from 'lib/hooks';
import { AddressApiResponse } from 'modules/address/types/addressApiResponse';

const AddressCompareView = ({ addressInfo }: { addressInfo: AddressApiResponse }) => {
  const { trackButtonClick } = useAnalytics(
    addressInfo.isDelegate ? ANALYTICS_PAGES.DELEGATE_DETAIL : ANALYTICS_PAGES.ADDRESS_DETAIL
  );

  const network = getNetwork();
  const bpi = useBreakpointIndex({ defaultIndex: 2 });

  const [account] = useAccountsStore(state => [state.currentAccount]);
  const address = account?.address;

  const { data: comparedVoteData } = usePollVoteCompare(
    addressInfo.delegateInfo ? addressInfo.delegateInfo.voteDelegateAddress : addressInfo.address,
    address
  );

  return (
    <PrimaryLayout shortenFooter={true} sx={{ maxWidth: [null, null, null, 'page', 'dashboard'] }}>
      <Head>
        <title>Maker Governance - Vote Compare</title>
      </Head>

      <SidebarLayout>
        <Stack gap={2}>
          {addressInfo.isDelegate && (
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
          )}

          {comparedVoteData ? (
            <Box>
              {comparedVoteData?.map(voteData => (
                <Box key={voteData.pollId}>
                  <Text as="p">Poll ID: {voteData.pollId}</Text>
                  <Text as="p">
                    {addressInfo.delegateInfo
                      ? addressInfo.delegateInfo.voteDelegateAddress
                      : addressInfo.address}
                    : {voteData.a1}
                  </Text>
                  <Text as="p">
                    {address}: {voteData.a2}
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

export default function AdressComparePage(): JSX.Element {
  const [addressInfo, setAddressInfo] = useState<AddressApiResponse>();
  const [error, setError] = useState<string>();
  const router = useRouter();
  const { address } = router.query;

  useEffect(() => {
    if (address) {
      fetchJson(`/api/address/${address}?network=${getNetwork()}`).then(setAddressInfo).catch(setError);
    }
  }, [address]);

  if (error) {
    return <ErrorPage statusCode={404} title="Error fetching delegate" />;
  }

  if (!addressInfo) {
    return (
      <PrimaryLayout shortenFooter={true}>
        <PageLoadingPlaceholder />
      </PrimaryLayout>
    );
  }

  return <AddressCompareView addressInfo={addressInfo} />;
}
