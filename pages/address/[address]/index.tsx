import { useEffect, useState } from 'react';
import { Heading, Box, Flex, NavLink, Button } from 'theme-ui';
import { useBreakpointIndex } from '@theme-ui/match-media';
import ErrorPage from 'next/error';
import Link from 'next/link';
import { Icon } from '@makerdao/dai-ui-icons';
import getMaker, { getNetwork } from 'lib/maker';
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
import { SupportedNetworks } from 'lib/constants';
import { utils } from 'ethers';

const AddressView = ({ addressInfo }: { addressInfo: AddressApiResponse }) => {
  const network = getNetwork();
  const bpi = useBreakpointIndex({ defaultIndex: 2 });

  const [delegatedFrom, setDelegatedFrom] = useState(null);

  const { trackButtonClick } = useAnalytics(
    addressInfo.isDelegate ? ANALYTICS_PAGES.DELEGATE_DETAIL : ANALYTICS_PAGES.ADDRESS_DETAIL
  );

  //Using monetsupply to test
  useEffect(() => {
    getMaker(network).then(maker => {
      maker
        .service('voteDelegate')
        .getMkrLockedDelegate(addressInfo.address)
        .then(data => {
          const red = data.reduce((acc, { fromAddress, lockAmount }) => {
            // const guy = '0xb088a3bc93f71b4de97b9de773e9647645983688';
            const currSum = acc[fromAddress]?.lockAmount
              ? utils.parseEther(acc[fromAddress]?.lockAmount)
              : utils.parseEther('0');

            acc[fromAddress] = { lockAmount: utils.formatEther(currSum.add(utils.parseEther(lockAmount))) };
            return acc;
          }, {});

          //TODO do this in the reducer
          const delegators = [];
          for (const x in red) {
            delegators.push({ address: x, ...red[x] });
          }

          setDelegatedFrom(delegators.sort((a, b) => (a.lockAmount > b.lockAmount ? -1 : 1)));
        });
    });
  }, []);
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
              <DelegateDetail delegate={addressInfo.delegateInfo} delegatedFrom={delegatedFrom} />
            )}
            {!addressInfo.delegateInfo && (
              <AddressDetail address={addressInfo.address} voteProxyInfo={addressInfo.voteProxyInfo} />
            )}
          </Box>
        </Stack>
        <Stack gap={3}>
          {addressInfo.isDelegate && addressInfo.delegateInfo && (
            <ManageDelegation delegate={addressInfo.delegateInfo} />
          )}
          <SystemStatsSidebar
            fields={['polling contract', 'savings rate', 'total dai', 'debt ceiling', 'system surplus']}
          />
          {addressInfo.isDelegate && <ResourceBox type={'delegates'} />}
          <ResourceBox type={'general'} />
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
