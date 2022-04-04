import { useEffect, useState } from 'react';
import { Box, Flex, Heading, Text, Button } from 'theme-ui';
import { DialogContent, DialogOverlay } from '@reach/dialog';
import { Icon } from '@makerdao/dai-ui-icons';
import BoxWithClose from 'modules/app/components/BoxWithClose';
import { slideUp, fadeIn } from 'lib/keyframes';
import { useBreakpointIndex } from '@theme-ui/match-media';
import { markdownToHtml } from 'lib/utils';
import InternalIcon from 'modules/app/components/Icon';
import { openWindowWithUrl } from 'lib/utils';

type Props = {
  isOpen: boolean;
  onDismiss: () => void;
  markdownContent: string;
  setTweetUrl: (pollId?: number) => string;
};

export const ShareVotesModal = ({ isOpen, onDismiss, markdownContent, setTweetUrl }: Props): JSX.Element => {
  const bpi = useBreakpointIndex();
  const [html, setHtml] = useState('');
  const [copied, setCopied] = useState(false);

  const setContent = async () => {
    const content = await markdownToHtml(markdownContent);
    setHtml(content);
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(markdownContent);
    setCopied(true);
    setTimeout(() => setCopied(false), 1000);
  };

  useEffect(() => {
    setContent();
  }, []);

  return (
    <DialogOverlay isOpen={isOpen} onDismiss={onDismiss}>
      <DialogContent
        sx={
          bpi === 0
            ? { variant: 'dialog.mobile', animation: `${slideUp} 350ms ease` }
            : {
                variant: 'dialog.desktop',
                animation: `${fadeIn} 350ms ease`,
                width: '720px',
                px: 5,
                py: 4
              }
        }
      >
        <BoxWithClose close={onDismiss}>
          <Flex sx={{ flexDirection: 'column' }}>
            <Heading sx={{ textAlign: 'center', mb: 3 }}>Share your votes</Heading>
            <Text sx={{ mb: 3, color: 'onSecondary', textAlign: 'center' }}>
              Your recent votes and comments are formatted below
            </Text>
            <Box sx={{ bg: 'background', px: 3 }}>
              <div dangerouslySetInnerHTML={{ __html: html || '' }} />
            </Box>
            <Flex sx={{ justifyContent: 'center', mt: 4, flexDirection: ['column', 'row'] }}>
              <Box sx={{ width: ['100%', '50%'], paddingRight: [0, 1], mb: [2, 0] }}>
                <Button onClick={copyToClipboard} sx={{ width: '100%' }}>
                  <Icon name="copy" mr={2} color="white" size={10} />
                  {copied ? 'Copied!' : 'Copy & paste on the forum'}
                </Button>
              </Box>
              <Box sx={{ width: ['100%', '50%'], paddingLeft: [0, 1] }}>
                <Button sx={{ width: '100%' }} onClick={() => openWindowWithUrl(setTweetUrl())}>
                  <Flex sx={{ alignItems: 'center', justifyContent: 'center' }}>
                    <InternalIcon color="white" name="twitter" size={15} />{' '}
                    <Text ml={1}>Share on Twitter</Text>
                  </Flex>
                </Button>
              </Box>
            </Flex>
          </Flex>
        </BoxWithClose>
      </DialogContent>
    </DialogOverlay>
  );
};
