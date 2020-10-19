/** @jsx jsx */
import { forwardRef, useMemo } from 'react';
import { Box, NavLink, Badge, jsx, Container } from 'theme-ui';
import Link from 'next/link';
import { Icon } from '@makerdao/dai-ui-icons';
import useSWR from 'swr';
import Skeleton from 'react-loading-skeleton';
import { CMSProposal } from '../../types/proposal';
import getMaker, { getNetwork } from '../../lib/maker';
import useAccountsStore from '../../stores/accounts';

type Props = {
  proposals: CMSProposal[];
  href?: string;
};

const ExecutiveIndicator = forwardRef<HTMLAnchorElement, Props>(
  ({ proposals, ...props }, ref): JSX.Element => {
    const message = `New executive vote${proposals.length > 1 ? 's' : ''}`;

    return (
      <NavLink
        ref={ref}
        href={`/executive?network=${getNetwork()}`}
        sx={{
          fontSize: 2,
          px: '3',
          borderRadius: 'round',
          border: '1px solid',
          borderColor: 'primary',
          color: 'surface',
          alignItems: 'center',
          backgroundColor: 'primary',
          display: 'inline-flex',
          '&:hover': {
            backgroundColor: 'primaryEmphasis',
            color: 'surface'
            // '> svg': { color: 'primary' }
          }
        }}
        {...props}
      >
        <Badge mr="3" variant="circle" p="3px">
          {proposals.length}
        </Badge>
        <Box pb="2px">{message}</Box>
        <Icon name="chevron_right" color="surface" size="3" ml="3" pb="1px" />
      </NavLink>
    );
  }
);

export default ({ proposals, hat, ...props }: { proposals: CMSProposal[]; hat?: string }): JSX.Element => {
  const newActiveProposals = useMemo(
    () =>
      proposals.filter(
        proposal => proposal.active && hat && hat.toLowerCase() !== proposal.address.toLowerCase()
      ),
    [hat, proposals]
  );
  const account = useAccountsStore(state => state.currentAccount);
  const voteProxy = useAccountsStore(state => (account ? state.proxies[account.address] : null));

  const { data: votedProposals } = useSWR<string[]>(
    ['/executive/voted-proposals', account?.address],
    (_, address) =>
      getMaker().then(maker =>
        maker
          .service('chief')
          .getVotedSlate(voteProxy ? voteProxy.getProxyAddress() : address)
          .then(slate => maker.service('chief').getSlateAddresses(slate))
      )
  );

  const newUnvotedProposals =
    votedProposals && account
      ? newActiveProposals.filter(
          proposal => !votedProposals.map(p => p.toLowerCase()).includes(proposal.address.toLowerCase())
        )
      : newActiveProposals;
  const shouldDisplay = newUnvotedProposals.length === 0 ? 'none' : null;
  return (
    <Container sx={{ textAlign: 'center', display: shouldDisplay }} {...props}>
      {account && !votedProposals ? (
        <Skeleton height="39px" width="400px" />
      ) : (
        <Link passHref href={{ pathname: '/executive', query: { network: getNetwork() } }}>
          <ExecutiveIndicator proposals={newUnvotedProposals} />
        </Link>
      )}
    </Container>
  );
};
