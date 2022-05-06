import { Button, Card, Flex, Text, Input, Spinner, Heading } from 'theme-ui';
import PrimaryLayout from 'modules/app/components/layout/layouts/Primary';
import { useState } from 'react';
import { useActiveWeb3React } from 'modules/web3/hooks/useActiveWeb3React';
import { useAccount } from 'modules/app/hooks/useAccount';
// import VoteModal from 'modules/executive/components/VoteModal';
import { analyzeSpell } from 'modules/executive/api/analyzeSpell';
import { SpellData } from 'modules/executive/types';
import { formatDateWithTime } from 'lib/datetime';
import { formatValue } from 'lib/string';
import { BigNumber } from 'ethers';

export default function ExecutiveAddress(): JSX.Element {
  const [spellAddress, setSpellAddress] = useState<string | null>(null);
  const [spellData, setSpellData] = useState<SpellData | null | undefined>(undefined);
  const [loading, setLoading] = useState(false);
  const [voting, setVoting] = useState(false);
  const { network } = useActiveWeb3React();
  // const { account } = useAccount();

  const handleInput = e => {
    if (e.target.value === '') {
      setSpellData(undefined);
    }
    setSpellAddress(e.target.value);
  };

  // const handleVote = () => {
  //   setVoting(true);
  // };

  const fetchSpellData = async () => {
    setSpellData(undefined);
    setLoading(true);
    if (!spellAddress) {
      setSpellData(undefined);
      setLoading(false);
      return null;
    }
    const data = await analyzeSpell(spellAddress, network);
    if (data && data.executiveHash === undefined) {
      setSpellData(null);
    } else {
      setSpellData(data);
    }
    setLoading(false);
    // return data;
  };

  return (
    <PrimaryLayout sx={{ maxWidth: [null, null, null, 'page', 'dashboard'] }}>
      <Card>
        <Heading>Spell address</Heading>
        <Input name="spellAddress" my={3} onChange={handleInput} />
        <Flex sx={{ alignItems: 'center' }}>
          <Button disabled={!spellAddress} onClick={handleVote} sx={{ mr: 3 }}>
            Vote for this address
          </Button>
          <Button disabled={!spellAddress} onClick={fetchSpellData}>
            Fetch spell details
          </Button>
          {loading && <Spinner size={20} ml={3} />}
        </Flex>
      </Card>
      {spellData !== undefined && (
        <Card sx={{ mt: 4 }}>
          <Flex sx={{ flexDirection: 'column' }}>
            <Heading>Spell details</Heading>
            {spellData === null && (
              <Flex sx={{ mt: 3 }}>
                <Text>No spell data found</Text>
              </Flex>
            )}
            {!!spellData && (
              <>
                <Flex sx={{ mt: 3 }}>
                  <Text>Executive hash:</Text>
                  <Text sx={{ ml: 3 }}>{spellData?.executiveHash}</Text>
                </Flex>
                <Flex sx={{ mt: 3 }}>
                  <Text>Data executed:</Text>
                  <Text sx={{ ml: 3 }}>{formatDateWithTime(spellData?.dateExecuted)}</Text>
                </Flex>
                <Flex sx={{ mt: 3 }}>
                  <Text>Data passed: </Text>
                  <Text sx={{ ml: 3 }}>{formatDateWithTime(spellData?.datePassed)}</Text>
                </Flex>
                <Flex sx={{ mt: 3 }}>
                  <Text>Available for execution at: </Text>
                  <Text sx={{ ml: 3 }}>{formatDateWithTime(spellData?.nextCastTime || spellData?.eta)}</Text>
                </Flex>
                <Flex sx={{ mt: 3 }}>
                  <Text>Expiration: </Text>
                  <Text sx={{ ml: 3 }}>{formatDateWithTime(spellData?.expiration)}</Text>
                </Flex>

                <Flex sx={{ mt: 3 }}>
                  <Text>Has been cast:</Text>
                  <Text sx={{ ml: 3 }}>{formatDateWithTime(spellData?.expiration)}</Text>
                </Flex>
                <Flex sx={{ mt: 3 }}>
                  <Text>Has been scheduled:</Text>
                  <Text sx={{ ml: 3 }}>{formatDateWithTime(spellData?.expiration)}</Text>
                </Flex>
                <Flex sx={{ mt: 3 }}>
                  <Text>MKR support:</Text>
                  <Text sx={{ ml: 3 }}>{formatValue(BigNumber.from(spellData?.mkrSupport))} MKR</Text>
                </Flex>
                <Flex sx={{ mt: 3 }}>
                  <Text>Next cast time:</Text>
                  <Text sx={{ ml: 3 }}>{formatDateWithTime(spellData?.nextCastTime)}</Text>
                </Flex>
                <Flex sx={{ mt: 3 }}>
                  <Text>Office hours:</Text>
                  <Text sx={{ ml: 3 }}>{spellData?.officeHours}</Text>
                </Flex>
              </>
            )}
          </Flex>
        </Card>
      )}
      {/* {voting && <VoteModal proposal={null} address={spellAddress} close={() => setVoting(false)} />} */}
    </PrimaryLayout>
  );
}
