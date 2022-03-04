import { Heading, Box, Flex, NavLink, Button } from 'theme-ui';
import { useBreakpointIndex } from '@theme-ui/match-media';
import ErrorPage from 'next/error';
import Link from 'next/link';
import { Icon } from '@makerdao/dai-ui-icons';
import { fetchJson } from 'lib/fetchJson';
import { useAnalytics } from 'modules/app/client/analytics/useAnalytics';
import { ANALYTICS_PAGES } from 'modules/app/client/analytics/analytics.constants';
import PrimaryLayout from 'modules/app/components/layout/layouts/Primary';
import SidebarLayout from 'modules/app/components/layout/layouts/Sidebar';
import Stack from 'modules/app/components/layout/layouts/Stack';
import SystemStatsSidebar from 'modules/app/components/SystemStatsSidebar';
import ResourceBox from 'modules/app/components/ResourceBox';
import PageLoadingPlaceholder from 'modules/app/components/PageLoadingPlaceholder';
import { useRouter } from 'next/router';
import { AddressApiResponse } from 'modules/address/types/addressApiResponse';
import { AddressDetail } from 'modules/address/components/AddressDetail';
import { DelegateDetail } from 'modules/delegates/components';
import { HeadComponent } from 'modules/app/components/layout/Head';
import ManageDelegation from 'modules/delegates/components/ManageDelegation';
import { useActiveWeb3React } from 'modules/web3/hooks/useActiveWeb3React';
import useSWR, { useSWRConfig } from 'swr';
import { ErrorBoundary } from 'modules/app/components/ErrorBoundary';

const AddressView = ({ addressInfo }: { addressInfo: AddressApiResponse }) => {
  const bpi = useBreakpointIndex({ defaultIndex: 2 });

  const { trackButtonClick } = useAnalytics(
    addressInfo.isDelegate ? ANALYTICS_PAGES.DELEGATE_DETAIL : ANALYTICS_PAGES.ADDRESS_DETAIL
  );

  return (
    <PrimaryLayout shortenFooter={true} sx={{ maxWidth: [null, null, null, 'page', 'dashboard'] }}>
      <HeadComponent
        title={`${
          addressInfo.isDelegate ? `${addressInfo.delegateInfo?.name} Delegate` : 'Address'
        } Information`}
        description={`See all the voting activity of ${
          addressInfo.delegateInfo?.name || addressInfo.address
        } in Maker Governance. `}
        image={addressInfo.delegateInfo?.picture}
      />

      <SidebarLayout>
        <Stack gap={2}>
          {addressInfo.isDelegate && (
            <Flex sx={{ alignItems: 'center' }}>
              <Heading variant="microHeading" mr={3}>
                <Link scroll={false} href={{ pathname: '/delegates' }}>
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
              <ErrorBoundary componentName="Delegate Information">
                <DelegateDetail delegate={addressInfo.delegateInfo} />
              </ErrorBoundary>
            )}
            {!addressInfo.delegateInfo && (
              <ErrorBoundary componentName="Address Information">
                <AddressDetail address={addressInfo.address} voteProxyInfo={addressInfo.voteProxyInfo} />
              </ErrorBoundary>
            )}
          </Box>
        </Stack>
        <Stack gap={3}>
          {addressInfo.isDelegate && addressInfo.delegateInfo && (
            <ErrorBoundary componentName="Delegate MKR">
              <ManageDelegation delegate={addressInfo.delegateInfo} />
            </ErrorBoundary>
          )}
          <ErrorBoundary componentName="System Info">
            <SystemStatsSidebar
              fields={['polling contract', 'savings rate', 'total dai', 'debt ceiling', 'system surplus']}
            />
          </ErrorBoundary>
          {addressInfo.isDelegate && <ResourceBox type={'delegates'} />}
          <ResourceBox type={'general'} />
        </Stack>
      </SidebarLayout>
    </PrimaryLayout>
  );
};

export default function AddressPage(): JSX.Element {
  const router = useRouter();
  const { address } = router.query;
  const { network } = useActiveWeb3React();
  const { cache } = useSWRConfig();

  const dataKeyAccount = `/api/address/${address}?network=${network}`;
  const { data, error } = useSWR<AddressApiResponse>(address ? dataKeyAccount : null, fetchJson, {
    revalidateIfStale: false,
    revalidateOnFocus: false,
    revalidateOnMount: !cache.get(dataKeyAccount),
    revalidateOnReconnect: false
  });

  if (error) {
    return <ErrorPage statusCode={404} title="Error fetching address information" />;
  }

  if (!data) {
    return (
      <PrimaryLayout shortenFooter={true}>
        <PageLoadingPlaceholder />
      </PrimaryLayout>
    );
  }

  return (
    <ErrorBoundary componentName="Address Page">
      <AddressView addressInfo={data} />
    </ErrorBoundary>
  );
}
