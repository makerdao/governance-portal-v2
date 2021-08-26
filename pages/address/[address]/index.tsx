/** @jsx jsx */
import { useEffect, useState } from 'react';
import { Heading, Box, jsx, Flex, NavLink, Button } from 'theme-ui';
import { useBreakpointIndex } from '@theme-ui/match-media';
import ErrorPage from 'next/error';
import Link from 'next/link';
import Head from 'next/head';
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
import { useRouter } from 'next/router';
import { AddressApiResponse } from 'modules/address/types/addressApiResponse';
import { AddressDetail } from 'modules/address/components/AddressDetail';
import { DelegateDetail } from 'modules/delegates/components';

const AddressView = ({ addressInfo }: { addressInfo: AddressApiResponse }) => {
  const network = getNetwork();
  const bpi = useBreakpointIndex({ defaultIndex: 2 });

  const { trackButtonClick } = useAnalytics(
    addressInfo.isDelegate ? ANALYTICS_PAGES.DELEGATE_DETAIL : ANALYTICS_PAGES.ADDRESS_DETAIL
  );

  return (
    <PrimaryLayout shortenFooter={true} sx={{ maxWidth: [null, null, null, 'page', 'dashboard'] }}>
      <Head>
        <title>Maker Governance - {addressInfo.isDelegate ? 'Delegate' : 'Address'} Information</title>
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

          <Box>
            {addressInfo.delegateInfo && (
              <DelegateDetail delegate={addressInfo.delegateInfo} stats={addressInfo.stats} />
            )}
            {!addressInfo.delegateInfo && (
              <AddressDetail address={addressInfo.address} stats={addressInfo.stats} />
            )}
          </Box>
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

export default function AddressPage(): JSX.Element {
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
    return <ErrorPage statusCode={404} title="Error fetching address information" />;
  }

  if (!addressInfo) {
    return (
      <PrimaryLayout shortenFooter={true}>
        <PageLoadingPlaceholder />
      </PrimaryLayout>
    );
  }

  return <AddressView addressInfo={addressInfo} />;
}
