/** @jsx jsx */
import { forwardRef, useMemo } from 'react';
import { Box, NavLink, Badge, jsx, Container, ThemeUIStyleObject } from 'theme-ui';
import Link from 'next/link';
import { Icon } from '@makerdao/dai-ui-icons';
import useSWR from 'swr';
import Skeleton from 'components/SkeletonThemed';
import { getNetwork } from 'lib/maker';
import { fetchJson } from 'lib/utils';
import { useVotedProposals } from 'modules/executives/hooks/useVotedProposals';
import useAccountsStore from 'stores/accounts';
import { CMSProposal } from 'modules/executives/types';
import { SpellData } from 'types/spellData';

type Props = {
  numProposals: number;
  href?: string;
};

const ExecutiveIndicator = forwardRef<HTMLAnchorElement, Props>(
  ({ numProposals, ...props }, ref): JSX.Element => {
    const message = `New executive vote${numProposals > 1 ? 's' : ''}`;

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
          {numProposals}
        </Badge>
        <Box pb="2px">{message}</Box>
        <Icon name="chevron_right" color="surface" size="3" ml="3" pb="1px" />
      </NavLink>
    );
  }
);

const ExecutiveIndicatorComponent = ({
  proposals,
  ...props
}: {
  proposals: CMSProposal[];
  sx?: ThemeUIStyleObject;
}): JSX.Element => {
  const { data: spellData } = useSWR<Record<string, SpellData>>(
    `/api/executive/analyze-spell?network=${getNetwork()}`,
    // needs to be a POST because the list of addresses is too long to be a GET query parameter
    url =>
      fetchJson(url, { method: 'POST', body: JSON.stringify({ addresses: proposals.map(p => p.address) }) }),
    { refreshInterval: 0 }
  );

  const activeProposals = useMemo(() => proposals.filter(proposal => proposal.active), [proposals]);
  const unscheduledProposals = spellData
    ? activeProposals.filter(proposal => !spellData[proposal.address]?.hasBeenScheduled)
    : activeProposals;
  const account = useAccountsStore(state => state.currentAccount);
  const { data: votedProposals } = useVotedProposals();
  const newUnvotedProposals =
    votedProposals && account
      ? unscheduledProposals.filter(
          proposal => !votedProposals.map(p => p.toLowerCase()).includes(proposal.address.toLowerCase())
        )
      : unscheduledProposals;

  const shouldDisplay = newUnvotedProposals.length === 0 ? 'none' : undefined;
  return (
    <Container sx={{ textAlign: 'center', display: shouldDisplay }} {...props}>
      {!spellData ? (
        <Skeleton height="39px" width="240px" />
      ) : (
        <Link passHref href={{ pathname: '/executive', query: { network: getNetwork() } }}>
          <ExecutiveIndicator numProposals={newUnvotedProposals.length} />
        </Link>
      )}
    </Container>
  );
};

export default ExecutiveIndicatorComponent;
