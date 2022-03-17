import { Flex, Heading, Link as ThemeUILink, Grid, Text } from 'theme-ui';
import Link from 'next/link';
import Skeleton from 'react-loading-skeleton';
import { ViewMore } from 'modules/home/components/ViewMore';
import ExecutiveOverviewCard from 'modules/executive/components/ExecutiveOverviewCard';
import { ErrorBoundary } from 'modules/app/components/ErrorBoundary';
import { Proposal } from 'modules/executive/types';
import { SupportedNetworks } from 'modules/web3/constants/networks';

type Props = {
  proposals: Proposal[];
  network: SupportedNetworks;
  hat?: string;
};

export const ExecutiveProposalsLanding = ({ proposals, network, hat }: Props): JSX.Element => (
  <Flex sx={{ flexDirection: 'column' }}>
    <Flex sx={{ justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
      <Heading>Executive Proposals</Heading>
      <Link href={{ pathname: '/executive' }} passHref>
        <ThemeUILink title="Executive Proposals">
          <ViewMore label="View All" />
        </ThemeUILink>
      </Link>
    </Flex>
    <Flex>
      <ErrorBoundary componentName="Executive Proposals">
        <Grid gap={4} columns={[1, 1, 2]}>
          {proposals ? (
            proposals.length > 0 ? (
              proposals
                .slice(0, 2)
                .map(proposal => (
                  <ExecutiveOverviewCard
                    key={proposal.address}
                    network={network}
                    votedProposals={[]}
                    isHat={hat ? hat.toLowerCase() === proposal.address.toLowerCase() : false}
                    proposal={proposal}
                  />
                ))
            ) : (
              <Text>No proposals found</Text>
            )
          ) : (
            <Skeleton />
          )}
        </Grid>
      </ErrorBoundary>
    </Flex>
  </Flex>
);
