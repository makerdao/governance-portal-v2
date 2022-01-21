import { Heading, Box, Button, Flex, Input, Label, Card, Text, Link } from 'theme-ui';
import PrimaryLayout from 'modules/app/components/layout/layouts/Primary';
import Stack from 'modules/app/components/layout/layouts/Stack';
import { useState } from 'react';
import { ethers } from 'ethers';
import matter from 'gray-matter';
import { markdownToHtml } from 'lib/utils';
import { getEtherscanLink } from 'modules/web3/helpers/getEtherscanLink';
import { SupportedNetworks } from 'modules/web3/constants/networks';
import { HeadComponent } from 'modules/app/components/layout/Head';

// Regexp to check if is an URL
const expr =
  /(https?:\/\/(?:www\.|(?!www))[a-zA-Z0-9][a-zA-Z0-9-]+[a-zA-Z0-9]\.[^\s]{2,}|www\.[a-zA-Z0-9][a-zA-Z0-9-]+[a-zA-Z0-9]\.[^\s]{2,}|https?:\/\/(?:www\.|(?!www))[a-zA-Z0-9]+\.[^\s]{2,}|www\.[a-zA-Z0-9]+\.[^\s]{2,})/gi;

export const URL_REGEX = new RegExp(expr);

/*
TODO: Add tests for executive create on goerli. Right now it only supports mainnet
*/
const ExecutiveCreate = () => {
  const [url, setUrl] = useState('');
  const [title, setTitle] = useState('');
  const [summary, setSummary] = useState('');
  const [markdown, setMarkdown] = useState('');
  const [date, setDate] = useState('');
  const [mainnetAddress, setMainnetAddress] = useState('');
  const [error, setError] = useState(['']);
  const [fetchFinished, setFetchFinished] = useState(false);
  const fields = [
    ['Title', title],
    ['Summary', summary],
    ['Date', date]
  ];

  const isValidUrl = url.match(URL_REGEX);

  const editMarkdown = content => {
    // hide the duplicate proposal title
    return content.replace(/^<h1>.*<\/h1>|^<h2>.*<\/h2>/, '');
  };

  const getFieldsFromUrl = async () => {
    let metadata, execMarkdown;
    setError([]);
    setFetchFinished(false);
    try {
      const rawMd = await (await fetch(url, { cache: 'no-cache' })).text();
      const { data, content } = matter(rawMd);
      metadata = data;
      execMarkdown = content;
    } catch (e) {
      setError(['failed to fetch']);
      return;
    }

    if (!metadata.title) setError(e => [...e, 'missing title']);
    if (!metadata.summary) setError(e => [...e, 'missing summary']);
    if (!execMarkdown) setError(e => [...e, 'missing markdown']);
    if (!metadata.date) setError(e => [...e, 'missing date']);
    if (!metadata.address) setError(e => [...e, 'missing mainnet address']);
    else {
      try {
        ethers.utils.getAddress(metadata.address);
      } catch (_) {
        setError(e => [...e, 'invalid mainnet address']);
      }
    }

    //remove `Template - [ ... ] ` from title
    const editTitle = title => {
      const vStr = 'Template - [Executive Vote] ';
      const pStr = 'Template - [Executive Proposal] ';
      if (title.indexOf(vStr) === 0) return title.replace(vStr, '');
      if (title.indexOf(pStr) === 0) return title.replace(pStr, '');
      return title;
    };

    setFetchFinished(true);
    setTitle(editTitle(metadata.title));
    setSummary(metadata.summary);
    setDate(metadata.date ? new Date(metadata.date).toUTCString() : '');
    setMainnetAddress(metadata.address);
    setMarkdown(await markdownToHtml(execMarkdown));
  };

  const TD = ({ children }) => (
    <td
      style={{
        border: '1px solid black'
      }}
    >
      {children}
    </td>
  );

  return (
    <PrimaryLayout shortenFooter={true} sx={{ maxWidth: 'dashboard' }}>
      <HeadComponent title="Validate Executive Proposal" />

      <Stack gap={3}>
        <Heading mb={2} as="h4">
          Executive Validator
        </Heading>
        <Card>
          <Stack gap={3} sx={{ p: [3, 4] }}>
            <div>
              <Box sx={{ mb: 3 }}>
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
                {error[0] ? (
                  <Flex
                    color="warning"
                    sx={{
                      flexDirection: 'row',
                      flexWrap: 'wrap',
                      alignItems: 'center',
                      border: '1px solid',
                      borderColor: 'error',
                      borderRadius: '5px',
                      p: 2,
                      fontWeight: 'bold'
                    }}
                  >
                    {error.map(e => (
                      <Flex key={e} sx={{ mr: 3, flexDirection: 'row', alignItems: 'center' }}>
                        <Text
                          sx={{
                            mr: 1,
                            border: '6px solid',
                            borderColor: 'warning',
                            borderRadius: '100px',
                            width: '12px',
                            height: '12px'
                          }}
                        ></Text>
                        <Text>{e}</Text>
                      </Flex>
                    ))}
                  </Flex>
                ) : fetchFinished ? (
                  <Flex
                    color="success"
                    sx={{
                      flexDirection: 'row',
                      flexWrap: 'wrap',
                      alignItems: 'center',
                      border: '1px solid',
                      borderColor: 'success',
                      borderRadius: '5px',
                      p: 2,
                      fontWeight: 'bold'
                    }}
                  >
                    <Text>
                      Valid executive proposal. Review details below, then update the list of active proposals
                      to post it to the vote portal
                    </Text>
                  </Flex>
                ) : null}
              </Box>
              {fetchFinished && (
                <table
                  style={{
                    border: '1px solid black'
                  }}
                >
                  <tbody>
                    {fields.map(([name, value]) => (
                      <tr key={name}>
                        <TD>{name}</TD>
                        <TD>{value}</TD>
                      </tr>
                    ))}
                    <tr key={'Mainnet Address'}>
                      <TD>Mainnet Address</TD>
                      <TD>
                        <Link
                          target="_blank"
                          href={getEtherscanLink(SupportedNetworks.MAINNET, mainnetAddress, 'address')}
                          sx={{ p: 0 }}
                        >
                          {mainnetAddress}
                        </Link>
                      </TD>
                    </tr>
                    <tr key={'Markdown'}>
                      <TD>Markdown</TD>
                      <TD>
                        <div dangerouslySetInnerHTML={{ __html: editMarkdown(markdown) }} />
                      </TD>
                    </tr>
                  </tbody>
                </table>
              )}
            </div>
          </Stack>
        </Card>
      </Stack>
    </PrimaryLayout>
  );
};

export default ExecutiveCreate;
