/** @jsx jsx */

import { Heading, Box, jsx, Button, Flex, Input, Label, Textarea, Select, Radio } from 'theme-ui';
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

const PollingCreate = () => {
  const bpi = useBreakpointIndex();

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
                      {/* <Box as="form" onSubmit={e => e.preventDefault()}> */}
                      <Box>
                        <Label htmlFor="url">URL</Label>
                        <Flex sx={{ flexDirection: 'row' }}>
                          <Input name="url" mb={3} />
                          <Button variant="smallOutline" sx={{ height: '42px', width: '80px', ml: 3 }}>
                            Validate
                          </Button>
                        </Flex>
                      </Box>

                      <Label htmlFor="title">Title</Label>
                      <Input name="title" mb={3} />
                      <Label htmlFor="summary">Summary</Label>
                      <Input name="summary" mb={3} />
                      <Label htmlFor="options">Vote Options</Label>
                      <Input name="options" mb={3} />
                      <Label htmlFor="type">Vote Type</Label>
                      <Select name="type" mb={3}>
                        <option>Plurality Voting</option>
                      </Select>
                      <Label htmlFor="category">Category</Label>
                      <Select name="category" mb={3}>
                        <option>Systemic Risk Variables</option>
                      </Select>
                      <Label htmlFor="start">Poll Start Time (UTC)</Label>
                      <Input
                        name="start"
                        defaultValue={new Date(Date.now()).toLocaleString()}
                        mb={3}
                        disabled
                      />
                      <Label htmlFor="end">Poll End Time (UTC)</Label>
                      <Input
                        name="end"
                        mb={3}
                        defaultValue={new Date(Date.now() + 12096e5).toLocaleString()}
                        disabled
                      />
                      <Label htmlFor="duration">Poll Duration</Label>
                      <Input name="duration" mb={3} defaultValue={'14 Days'} disabled />
                      <Label htmlFor="proposal">Proposal</Label>
                      <Textarea name="proposal" mb={3} />
                      <Flex>
                        <Button variant="primary">Create Poll</Button>
                        <Button variant="outline" sx={{ ml: 4 }}>
                          Reset Form
                        </Button>
                      </Flex>

                      {/* </Box> */}
                    </div>,
                    <div key={1} sx={{ p: [3, 4] }}>
                      <table sx={{ width: '100%', textAlign: 'center', border: '1px solid black' }}>
                        <tr>
                          <th>Poll ID</th>
                          <th>Link</th>
                          <th>Status</th>
                          <th>Poll Title</th>
                          <th>Select</th>
                        </tr>
                        <tr>
                          <td>411</td>
                          <td>Icon</td>
                          <td>Pending</td>
                          <td sx={{ textAlign: 'left' }}>Increase System Surplus Buffer</td>
                          <td>
                            <Flex sx={{ justifyContent: 'center' }}>
                              <Radio name="pollSelect" />
                            </Flex>
                          </td>
                        </tr>
                      </table>
                    </div>
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
