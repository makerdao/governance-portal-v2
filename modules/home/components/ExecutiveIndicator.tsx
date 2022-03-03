import { forwardRef, useMemo } from 'react';
import { Box, NavLink, Badge, Container, ThemeUIStyleObject } from 'theme-ui';
import Link from 'next/link';
import { Icon } from '@makerdao/dai-ui-icons';
import Skeleton from 'modules/app/components/SkeletonThemed';
import { useVotedProposals } from 'modules/executive/hooks/useVotedProposals';
import { CMSProposal } from 'modules/executive/types';
import { useAccount } from 'modules/app/hooks/useAccount';
import { useActiveWeb3React } from 'modules/web3/hooks/useActiveWeb3React';
import { useAllSpellData } from 'modules/executive/hooks/useAllSpellData';

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
        href={'/executive'}
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
  const { network } = useActiveWeb3React();
  const { data: spellData } = useAllSpellData(
    proposals.map(p => p.address),
    network
  );
  const unscheduledProposals = spellData
    ? proposals.filter(proposal => !spellData[proposal.address]?.hasBeenScheduled)
    : proposals;
  const { account } = useAccount();
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
        <Link passHref href={{ pathname: '/executive' }}>
          <ExecutiveIndicator numProposals={newUnvotedProposals.length} />
        </Link>
      )}
    </Container>
  );
};

export default ExecutiveIndicatorComponent;
