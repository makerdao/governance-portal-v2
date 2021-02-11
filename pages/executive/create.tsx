/** @jsx jsx */

import { Heading, Box, jsx, Button, Flex, Input, Label, Card } from 'theme-ui';
import Head from 'next/head';
import { useBreakpointIndex } from '@theme-ui/match-media';
import PrimaryLayout from '../../components/layouts/Primary';
import SidebarLayout from '../../components/layouts/Sidebar';
import Stack from '../../components/layouts/Stack';
import SystemStatsSidebar from '../../components/SystemStatsSidebar';
import MkrLiquiditySidebar from '../../components/MkrLiquiditySidebar';
import ResourceBox from '../../components/ResourceBox';
import { useState } from 'react';
import { URL_REGEX } from '../../lib/constants';
import { ethers } from 'ethers';

const ExecutiveCreate = () => {
  const bpi = useBreakpointIndex();

  const [url, setUrl] = useState('');
  const [title, setTitle] = useState('');
  const [summary, setSummary] = useState('');
  const [markdown, setMarkdown] = useState('');
  const [date, setDate] = useState('');
  const [mainnetAddress, setMainnetAddress] = useState('');
  const [kovanAddress, setKovanAddress] = useState('');
  const [error, setError] = useState('');
  const [fetchFinished, setFetchFinished] = useState(false);

  const fields = [
    ['Title', title],
    ['Summary', summary],
    ['Date', date],
    ['Markdown', markdown],
    ['Mainnet Address', mainnetAddress],
    ['Kovan Address', kovanAddress]
  ];

  const isValidUrl = url.match(URL_REGEX);

  const getFieldsFromUrl = async () => {
    let execJson;
    setError('');
    setFetchFinished(false);
    try {
      execJson = await (await fetch(url, { cache: 'no-cache' })).json();
      console.log('execJson', execJson);
    } catch (e) {
      setError('failed to fetch');
      return;
    }

    if (!execJson.title) setError(e => e + 'missing title ');
    if (!execJson.summary) setError(e => e + 'missing summary ');
    if (!execJson.markdown) setError(e => e + 'missing markdown ');
    if (!execJson.date) setError(e => e + 'missing date ');
    if (!execJson.active && execJson.active !== false) setError(e => e + 'missing active status ');
    if (!execJson.date) setError(e => e + 'missing date ');
    if (
      execJson.date &&
      Math.abs(new Date(execJson.date).getTime() - Date.now()) > 1000 * 60 * 60 * 24 * 7 * 2
    )
      setError(e => e + 'date is more than two weeks from now ');
    if (!execJson.date) setError(e => e + 'missing date ');
    if (!execJson.address) setError(e => e + 'missing mainnet address ');
    try {
      ethers.utils.getAddress(execJson.address);
    } catch (_) {
      setError(e => e + 'invalid mainnet address ');
    }
    if (!execJson.kovanAddress) setError(e => e + 'missing kovan address ');
    try {
      ethers.utils.getAddress(execJson.kovanAddress);
    } catch (_) {
      setError(e => e + 'invalid kovan address ');
    }

    setFetchFinished(true);
    setTitle(execJson.title);
    setSummary(execJson.summary);
    setMarkdown(execJson.markdown);
    setDate(execJson.date);
    setMainnetAddress(execJson.address);
    setKovanAddress(execJson.kovanAddress);
  };

  return (
    <PrimaryLayout shortenFooter={true} sx={{ maxWidth: 'dashboard' }}>
      <Head>
        <title>Maker Governance - Validate Executive Proposal</title>
      </Head>
      <Stack gap={3}>
        <Heading mb={2} as="h4">
          Executive Validator
        </Heading>
        <SidebarLayout>
          <Card>
            <Stack gap={3} sx={{ p: [3, 4] }}>
              <div>
                <Box>
                  <Label htmlFor="url">URL</Label>
                  <Flex sx={{ flexDirection: 'row' }}>
                    <Input name="url" mb={3} onChange={e => setUrl(e.target.value)} />
                    <Button
                      variant="smallOutline"
                      sx={{ height: '42px', width: '80px', ml: 3 }}
                      disabled={!isValidUrl}
                      onClick={getFieldsFromUrl}
                    >
                      Validate
                    </Button>
                  </Flex>
                  {error ? <div>{error}</div> : null}
                </Box>
                {fetchFinished &&
                  fields.map(([name, value]) => (
                    <div key={name}>
                      <div>{name}</div>
                      <div>{value}</div>
                    </div>
                  ))}
              </div>
            </Stack>
          </Card>
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

export default ExecutiveCreate;
