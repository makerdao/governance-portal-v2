import { useEffect, useState } from 'react';
import { Box, Flex, Heading, Text, Button } from 'theme-ui';
import { DialogContent, DialogOverlay } from '@reach/dialog';
import { Icon } from '@makerdao/dai-ui-icons';
import BoxWithClose from 'modules/app/components/BoxWithClose';
import { slideUp, fadeIn } from 'lib/keyframes';
import { useBreakpointIndex } from '@theme-ui/match-media';
import { markdownToHtml } from 'lib/utils';

type Props = {
  isOpen: boolean;
  onDismiss: () => void;
  markdownContent: string;
};

export const MarkdownVotesModal = ({ isOpen, onDismiss, markdownContent }: Props): JSX.Element => {
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
            <Flex sx={{ justifyContent: 'center', mt: 4 }}>
              <Button onClick={copyToClipboard} sx={{ width: '250px' }}>
                <Icon name="copy" mr={2} color="white" size={10} />
                {copied ? 'Copied!' : 'Copy & paste on the forum'}
              </Button>
              {/* <Button>Download markdown file</Button> */}
            </Flex>
          </Flex>
        </BoxWithClose>
      </DialogContent>
    </DialogOverlay>
  );
};
