/** @jsx jsx */
import { useState } from 'react';
import { Heading, Text, Box, jsx, Button, Flex, Input, Label, Textarea, Select, Radio } from 'theme-ui';
import Head from 'next/head';
import Link from 'next/link';
import { Icon } from '@makerdao/dai-ui-icons';
import { useBreakpointIndex } from '@theme-ui/match-media';
import { isDefaultNetwork, getNetwork } from '../../lib/maker';
import PrimaryLayout from '../../components/layouts/Primary';
import SidebarLayout from '../../components/layouts/Sidebar';
import Stack from '../../components/layouts/Stack';
import Tabs from '../../components/Tabs';
import SystemStatsSidebar from '../../components/SystemStatsSidebar';
import MkrLiquiditySidebar from '../../components/MkrLiquiditySidebar';
import ResourceBox from '../../components/ResourceBox';
import { validateUrl } from '../../lib/polling/validator';
import getMaker from '../../lib/maker';
import Poll from '../../types/poll';
import { transactionsApi } from '../../stores/transactions';
import Hash from 'ipfs-only-hash';

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
const PollingCreate = () => {
  const bpi = useBreakpointIndex();
  const [pollUrl, setPollUrl] = useState('');
  const [parsedPoll, setParsedPoll] = useState<Poll | undefined>();
  const [pollErrors, setPollErrors] = useState<string[]>([]);
  const urlValidation = async url => {
    const result = await validateUrl(url, {
      pollId: 0,
      multiHash: '',
      startDate: 0,
      endDate: 0,
      url: pollUrl
    });
    if (result.valid) {
      const poll = result.parsedData;
      if (poll) {
        poll.multiHash = await generateIPFSHash(poll.content, {});
        poll.slug = poll.multiHash.slice(0, 8);
      }

      setParsedPoll(poll);
      setPollErrors([]);
    } else {
      setPollErrors(result.errors);
    }
  };

  const createPoll = async () => {
    const maker = await getMaker();
    const voteTxCreator = () =>
      maker
        .service('govPolling')
        .createPoll(parsedPoll?.startDate, parsedPoll?.endDate, parsedPoll?.multiHash, parsedPoll?.url);
    const txId = await transactionsApi
      .getState()
      .track(voteTxCreator, `Creating poll with id ${parsedPoll?.pollId}`, {
        mined: txId => {
          setParsedPoll(undefined);
          transactionsApi.getState().setMessage(txId, `Created poll with id ${parsedPoll?.pollId}`);
        }
      });
  };

  return (
    <PrimaryLayout shortenFooter={true} sx={{ maxWidth: 'dashboard' }}>
      <Head>
        <title>Maker Governance - Create Poll</title>
      </Head>
      {/* {mobileVotingPoll && (
        <MobileVoteSheet
          account={account}
          editingOnly
          poll={mobileVotingPoll}
          close={() => setMobileVotingPoll(null)}
        />
      )} */}
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
                        Poll URL Invalid: {pollErrors.join(', ')}
                      </Text>
                      {/* <Label>Poll ID</Label>
                      <CreateText>{parsedPoll?.pollId}</CreateText> */}
                      <Label>MultiHash</Label>
                      <CreateText>{parsedPoll?.multiHash}</CreateText>
                      <Label>Slug</Label>
                      <CreateText>{parsedPoll?.slug}</CreateText>
                      <Label>Title</Label>
                      <CreateText>{parsedPoll?.title}</CreateText>
                      <Label>Summary</Label>
                      <CreateText>{parsedPoll?.summary}</CreateText>
                      <Label>Vote Options</Label>
                      <CreateText>{JSON.stringify(parsedPoll?.options)}</CreateText>
                      <Label>Vote Type</Label>
                      <CreateText>{parsedPoll?.voteType}</CreateText>
                      <Label>Category</Label>
                      <CreateText>{parsedPoll?.categories.join(', ')}</CreateText>
                      <Label>Poll Start Time (UTC)</Label>
                      <CreateText>
                        {parsedPoll && new Date(parseInt(parsedPoll?.startDate) * 1000).toLocaleString()}
                      </CreateText>
                      <Label>Poll End Time (UTC)</Label>
                      <CreateText>
                        {parsedPoll && new Date(parseInt(parsedPoll?.endDate) * 1000).toLocaleString()}
                      </CreateText>
                      {/* <Label>Discussion Link</Label>
                      <CreateText>{parsedPoll && parsedPoll.discussionLink}</CreateText> */}
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
                        {parsedPoll?.content}
                      </Text>
                      <Flex>
                        <Button
                          variant="primary"
                          onClick={createPoll}
                          disabled={typeof parsedPoll === 'undefined' || pollErrors.length > 0}
                        >
                          Create Poll
                        </Button>
                        <Button variant="outline" sx={{ ml: 4 }} onClick={() => setParsedPoll(undefined)}>
                          Reset Form
                        </Button>
                      </Flex>
                    </div>
                    // <div key={1} sx={{ p: [3, 4] }}>
                    //   <table sx={{ width: '100%', textAlign: 'center', border: '1px solid black' }}>
                    //     <thead>
                    //       <tr>
                    //         <th>Poll ID</th>
                    //         <th>Link</th>
                    //         <th>Status</th>
                    //         <th>Poll Title</th>
                    //         <th>Select</th>
                    //       </tr>
                    //     </thead>
                    //     <tbody>
                    //       <tr>
                    //         <td>411</td>
                    //         <td>Icon</td>
                    //         <td>Pending</td>
                    //         <td sx={{ textAlign: 'left' }}>Increase System Surplus Buffer</td>
                    //         <td>
                    //           <Flex sx={{ justifyContent: 'center' }}>
                    //             <Radio name="pollSelect" />
                    //           </Flex>
                    //         </td>
                    //       </tr>
                    //     </tbody>
                    //   </table>
                    // </div>
                  ]}
                />
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

// multiHash: 'QmWPAu5zvDkBeVKqq9MGy4sYBgQfm5H1BtrYENMmq9J7xA',
// url:
//   'https://raw.githubusercontent.com/makerdao/community/master/governance/polls/Adjust%20the%20Dust%20Parameter%20-%20January%2018%2C%202021.md',
// slug: 'QmWPAu5z',
// options: { '0': 'Abstain', '1': 'Yes', '2': 'No' },
// discussionLink: 'https://forum.makerdao.com/t/signal-request-increasing-dust-parameter/5963',
