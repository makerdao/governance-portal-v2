import { Box, Heading, Text } from 'theme-ui';
import PrimaryLayout from 'modules/app/components/layout/layouts/Primary';
import SidebarLayout from 'modules/app/components/layout/layouts/Sidebar';
import { HeadComponent } from 'modules/app/components/layout/Head';
import { getRelayerBalance } from 'modules/polling/api/getRelayerBalance';
import { SupportedNetworks } from 'modules/web3/constants/networks';

const StatsPage = ({ balanceMainnet, balanceTestnet }): React.ReactElement => {
  return (
    <PrimaryLayout sx={{ maxWidth: [null, null, null, 'page', 'dashboard'] }}>
      <HeadComponent title="Account" />

      <SidebarLayout>
        <Box sx={{ mb: 6 }}>
          <Box sx={{ my: 3 }}>
            <Heading as="h3" variant="microHeading">
              Stats
            </Heading>
          </Box>
          <Box>
            <Text as="p">
              Relayer balance Mainnet: {balanceMainnet} 
            </Text>
            <Text as="p">
              Relayer balance Testnet: {balanceTestnet}
            </Text>
          </Box>
        </Box>
      </SidebarLayout>
    </PrimaryLayout>
  );
};

export async function getServerSideProps(context) {
  const balanceMainnet = await getRelayerBalance(SupportedNetworks.MAINNET);
  const balanceTestnet = await getRelayerBalance(SupportedNetworks.GOERLI);
  return {
    props: {
      balanceMainnet,
      balanceTestnet
    } // will be passed to the page component as props
  };
}

export default StatsPage;
