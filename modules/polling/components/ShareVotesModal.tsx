import { useEffect, useState } from 'react';
import { Box, Flex, Heading, Text, Button } from 'theme-ui';
import { Icon } from '@makerdao/dai-ui-icons';
import BoxWithClose from 'modules/app/components/BoxWithClose';
import { markdownToHtml } from 'lib/markdown';
import InternalIcon from 'modules/app/components/Icon';
import { openWindowWithUrl } from 'lib/utils';
import { DialogContent, DialogOverlay } from 'modules/app/components/Dialog';

type Props = {
  isOpen: boolean;
  onDismiss: () => void;
  markdownContent: string;
  twitterContent: string;
};

export const ShareVotesModal = ({
  isOpen,
  onDismiss,
  markdownContent,
  twitterContent
}: Props): JSX.Element => {
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
      <DialogContent widthDesktop="720px">
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
                  <Icon name="copy" mr={2} color="background" size={12} />
                  {copied ? 'Copied!' : 'Copy & paste on the forum'}
                </Button>
              </Box>
              <Box sx={{ width: ['100%', '50%'], paddingLeft: [0, 1] }}>
                <Button sx={{ width: '100%' }} onClick={() => openWindowWithUrl(twitterContent)}>
                  <Flex sx={{ alignItems: 'center', justifyContent: 'center' }}>
                    <InternalIcon name="twitter" size={15} /> <Text ml={1}>Share on Twitter</Text>
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
