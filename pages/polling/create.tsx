/** @jsx jsx */
import React, { useState } from 'react';
import { Heading, Text, Box, jsx, Button, Flex, Input, Label, Link as ExternalLink } from 'theme-ui';
import Head from 'next/head';
import Link from 'next/link';
import { Icon } from '@makerdao/dai-ui-icons';
import { useBreakpointIndex } from '@theme-ui/match-media';
import { getNetwork } from 'lib/maker';
import PrimaryLayout from 'components/layouts/Primary';
import SidebarLayout from 'components/layouts/Sidebar';
import Stack from 'components/layouts/Stack';
import Tabs from 'components/Tabs';
import PollCreateModal from 'components/PollCreateModal';
import SystemStatsSidebar from 'components/SystemStatsSidebar';
import MkrLiquiditySidebar from 'components/MkrLiquiditySidebar';
import ResourceBox from 'components/ResourceBox';
import { validateUrl } from 'lib/polling/validator';
import { Poll } from 'types/poll';
import Hash from 'ipfs-only-hash';
import useAccountsStore from 'stores/accounts';

const generateIPFSHash = async (data, options) => {
  // options object has the key encoding which defines the encoding type
  // of the data string that has been passed in
  const bufferData = Buffer.from(data, options.encoding || 'ascii');
  const hash = await Hash.of(bufferData);
  return hash;
};

const CreateText = ({ children }) => {
  return (
    <Text
      mb={3}
      sx={{ width: '100%', border: '1px solid #d5d9e0', borderRadius: 'small', minHeight: '42px' }}
    >
      {children}
    </Text>
  );
};
const PollingCreate = (): React.ReactElement => {
  const bpi = useBreakpointIndex();
  const [pollUrl, setPollUrl] = useState('');
  const [poll, setPoll] = useState<Poll | undefined>();
  const [pollErrors, setPollErrors] = useState<string[]>([]);
  const [creating, setCreating] = useState(false);
  const account = useAccountsStore(state => state.currentAccount);
  const urlValidation = async url => {
    const result = await validateUrl(url, {
      pollId: 0,
      multiHash: '',
      startDate: new Date(0),
      endDate: new Date(0),
      url: pollUrl
    });
    if (result.valid) {
      const poll = result.parsedData;
      if (poll) {
        poll.multiHash = await generateIPFSHash(poll.content, {});
        poll.slug = poll.multiHash.slice(0, 8);
      }
      setPoll(poll);
      setPollErrors([]);
    } else {
      setPollErrors(result.errors);
    }
  };

  return (
    <PrimaryLayout shortenFooter={true} sx={{ maxWidth: 'dashboard' }}>
      <Head>
        <title>Maker Governance - Create Poll</title>
      </Head>
      <Stack gap={3}>
        <Heading mb={2} as="h4">
          Create Poll
        </Heading>
        <SidebarLayout>
          <Box>
            <Stack gap={2}>
              <Link href={{ pathname: '/polling', query: { network: getNetwork() } }}>
                <Button variant="smallOutline" sx={{ width: 'max-content' }}>
                  <Icon name="chevron_left" size="2" mr={2} />
                  Back To All Polls
                </Button>
              </Link>
              <Stack gap={3}>
                <Tabs
                  tabListStyles={{ pl: [3, 4] }}
                  tabTitles={['Poll Creator', 'Poll Explorer']}
                  tabPanels={[
                    <div key={1} sx={{ p: [3, 4] }}>
                      <Box>
                        <Label htmlFor="url">URL</Label>
                        <Flex sx={{ flexDirection: 'row' }}>
                          <Input name="url" mb={3} onChange={e => setPollUrl(e.target.value)} />
                          <Button
                            variant="smallOutline"
                            onClick={() => urlValidation(pollUrl)}
                            sx={{ height: '42px', width: '80px', ml: 3 }}
                          >
                            Validate
                          </Button>
                        </Flex>
                      </Box>
                      <Text color="red" sx={{ display: pollErrors?.length > 0 ? 'inherit' : 'none' }}>
                        Errors: {pollErrors.join(', ')}
                      </Text>
                      <Label>MultiHash</Label>
                      <CreateText>{poll?.multiHash}</CreateText>
                      <Label>Slug</Label>
                      <CreateText>{poll?.slug}</CreateText>
                      <Label>Title</Label>
                      <CreateText>{poll?.title}</CreateText>
                      <Label>Summary</Label>
                      <CreateText>{poll?.summary}</CreateText>
                      <Label>Vote Options</Label>
                      <CreateText>{JSON.stringify(poll?.options)}</CreateText>
                      <Label>Vote Type</Label>
                      <CreateText>{poll?.voteType}</CreateText>
                      <Label>Category</Label>
                      <CreateText>{poll?.categories.join(', ')}</CreateText>
                      <Label>Poll Start Time</Label>
                      <CreateText>
                        {poll &&
                          new Date(poll.startDate).toLocaleString('default', {
                            month: 'long',
                            day: 'numeric',
                            year: 'numeric',
                            timeZone: 'UTC',
                            timeZoneName: 'short'
                          })}
                      </CreateText>
                      <Label>Poll End Time</Label>
                      <CreateText>
                        {poll &&
                          new Date(poll.endDate).toLocaleString('default', {
                            month: 'long',
                            day: 'numeric',
                            year: 'numeric',
                            timeZone: 'UTC',
                            timeZoneName: 'short'
                          })}
                      </CreateText>
                      <Label>Poll Duration</Label>
                      <CreateText>
                        {poll &&
                          `${
                            (new Date(poll.endDate).getTime() - new Date(poll.startDate).getTime()) / 86400000
                          } days`}
                      </CreateText>
                      <Label>Discussion Link</Label>
                      {poll && poll.discussionLink && (
                        <ExternalLink target="_blank" href={poll.discussionLink} sx={{ p: 0 }}>
                          <CreateText>{poll && poll.discussionLink}</CreateText>
                        </ExternalLink>
                      )}
                      <Label>Proposal</Label>
                      <Text
                        mb={3}
                        sx={{
                          width: '100%',
                          border: '1px solid #d5d9e0',
                          borderRadius: 'small',
                          height: '140px',
                          overflow: 'scroll'
                        }}
                      >
                        {poll?.content}
                      </Text>
                      <Flex>
                        <Button
                          variant="primary"
                          onClick={() => setCreating(true)}
                          disabled={typeof poll === 'undefined' || pollErrors.length > 0 || !account}
                        >
                          Create Poll
                        </Button>
                        <Button variant="outline" sx={{ ml: 4 }} onClick={() => setPoll(undefined)}>
                          Reset Form
                        </Button>
                      </Flex>
                    </div>
                  ]}
                />
                {creating && (
                  <PollCreateModal close={() => setCreating(false)} poll={poll} setPoll={setPoll} />
                )}
              </Stack>
            </Stack>
          </Box>
          {bpi >= 3 && (
            <Stack gap={3}>
              <SystemStatsSidebar
                fields={['chief contract', 'mkr needed to pass', 'savings rate', 'total dai', 'debt ceiling']}
              />
              <MkrLiquiditySidebar />
              <ResourceBox />
            </Stack>
          )}
        </SidebarLayout>
      </Stack>
    </PrimaryLayout>
  );
};

export default PollingCreate;
