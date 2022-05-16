import { useEffect } from 'react';
import { Button, Card, Flex, Text, Heading } from 'theme-ui';
import PrimaryLayout from 'modules/app/components/layout/layouts/Primary';
import { useState } from 'react';
import { useActiveWeb3React } from 'modules/web3/hooks/useActiveWeb3React';
import { useAccount } from 'modules/app/hooks/useAccount';
import { useVotedProposals } from 'modules/executive/hooks/useVotedProposals';
import VoteModal from 'modules/executive/components/VoteModal';
import { analyzeSpell } from 'modules/executive/api/analyzeSpell';
import { SpellData } from 'modules/executive/types';
import { formatDateWithTime } from 'lib/datetime';
import { formatValue } from 'lib/string';
import { BigNumber } from 'ethers';
import { DEFAULT_NETWORK } from 'modules/web3/constants/networks';
import { ExternalLink } from 'modules/app/components/ExternalLink';
import { getEtherscanLink } from 'modules/web3/helpers/getEtherscanLink';

type Props = {
  address: string;
  spellDetails: SpellData | null | undefined;
};

export default function CustomSpellAddress({ spellDetails }: Props): JSX.Element {
  const [voting, setVoting] = useState(false);
  const { network } = useActiveWeb3React();
  const { account, voteDelegateContractAddress, voteProxyContractAddress } = useAccount();
  const address = voteDelegateContractAddress || voteProxyContractAddress || account;

  const { data: votedProposals, mutate: mutateVotedProposals } = useVotedProposals();

  // revalidate votedProposals if connected address changes
  useEffect(() => {
    mutateVotedProposals();
  }, [address]);

  const hasVotedFor =
    votedProposals &&
    !!votedProposals.find(proposalAddress => proposalAddress.toLowerCase() === address?.toLowerCase());

  const handleVote = () => {
    setVoting(true);
  };

  return (
    <PrimaryLayout sx={{ maxWidth: [null, null, null, 'page', 'dashboard'] }}>
      <Heading>Custom Spell Voting Module</Heading>
      <Text as="p" sx={{ mt: 3, color: 'onSecondary' }}>
        This page can be used to vote on custom executive spells by manually entering the spell address.
        Fetching spell details for a custom executive spell might return some empty values in case they are
        not available, but it would still be possible to vote on the spell. Be cautious of malicious spells
        and only use this page in case of emergencies!
      </Text>
      <Heading sx={{ mt: 4, mb: 3 }}>Spell address</Heading>
      <Card>
        {address && (
          <ExternalLink href={getEtherscanLink(network, address, 'address')} title="View on Etherscan">
            <Text as="p" sx={{ fontSize: [1, 4], mb: 3 }}>
              {address}
            </Text>
          </ExternalLink>
        )}
        <Flex sx={{ alignItems: 'center' }}>
          <Button disabled={!address || !account} onClick={handleVote} sx={{ mr: 3 }}>
            Vote for this address
          </Button>
        </Flex>
      </Card>
      {spellDetails !== undefined && (
        <>
          <Heading sx={{ mt: 4, mb: 3 }}>Spell details</Heading>
          <Card>
            <Flex sx={{ flexDirection: 'column' }}>
              {spellDetails === null && (
                <Flex sx={{ mt: 3 }}>
                  <Text>No spell details found</Text>
                </Flex>
              )}

              {!!spellDetails && (
                <>
                  <Flex sx={{ mt: 3 }}>
                    <Text>Executive hash:</Text>
                    <Text sx={{ ml: 3 }}>{spellDetails?.executiveHash}</Text>
                  </Flex>
                  <Flex sx={{ mt: 3 }}>
                    <Text>Data executed:</Text>
                    <Text sx={{ ml: 3 }}>{formatDateWithTime(spellDetails?.dateExecuted)}</Text>
                  </Flex>
                  <Flex sx={{ mt: 3 }}>
                    <Text>Data passed: </Text>
                    <Text sx={{ ml: 3 }}>{formatDateWithTime(spellDetails?.datePassed)}</Text>
                  </Flex>
                  <Flex sx={{ mt: 3 }}>
                    <Text>Available for execution at: </Text>
                    <Text sx={{ ml: 3 }}>
                      {formatDateWithTime(spellDetails?.nextCastTime || spellDetails?.eta)}
                    </Text>
                  </Flex>
                  <Flex sx={{ mt: 3 }}>
                    <Text>Expiration: </Text>
                    <Text sx={{ ml: 3 }}>{formatDateWithTime(spellDetails?.expiration)}</Text>
                  </Flex>

                  <Flex sx={{ mt: 3 }}>
                    <Text>Has been cast:</Text>
                    <Text sx={{ ml: 3 }}>{spellDetails?.hasBeenCast ? 'true' : 'false'}</Text>
                  </Flex>
                  <Flex sx={{ mt: 3 }}>
                    <Text>Has been scheduled:</Text>
                    <Text sx={{ ml: 3 }}>{spellDetails?.hasBeenScheduled ? 'true' : 'false'}</Text>
                  </Flex>
                  <Flex sx={{ mt: 3 }}>
                    <Text>MKR support:</Text>
                    <Text sx={{ ml: 3 }}>{formatValue(BigNumber.from(spellDetails?.mkrSupport))} MKR</Text>
                  </Flex>
                  <Flex sx={{ mt: 3 }}>
                    <Text>Next cast time:</Text>
                    <Text sx={{ ml: 3 }}>{formatDateWithTime(spellDetails?.nextCastTime)}</Text>
                  </Flex>
                  <Flex sx={{ mt: 3 }}>
                    <Text>Office hours:</Text>
                    <Text sx={{ ml: 3 }}>{spellDetails?.officeHours ? 'true' : 'false'}</Text>
                  </Flex>
                </>
              )}
            </Flex>
          </Card>
        </>
      )}
      {hasVotedFor && (
        <>
          <Heading sx={{ mt: 4, mb: 3 }}>Your Vote</Heading>
          <Card>
            <Flex sx={{ mt: 3 }}>
              <Text>You are currently supporting this executive spell address</Text>
            </Flex>
          </Card>
        </>
      )}
      {voting && address && <VoteModal address={address} close={() => setVoting(false)} />}
    </PrimaryLayout>
  );
}

export async function getServerSideProps({ params }) {
  const address = (params || {})['address'] as string;
  const data = await analyzeSpell(address, DEFAULT_NETWORK.network);

  let spellDetails;

  if (data && data.executiveHash === undefined) {
    spellDetails = null;
  } else spellDetails = data;

  return {
    props: {
      address,
      spellDetails
    }
  };
}
