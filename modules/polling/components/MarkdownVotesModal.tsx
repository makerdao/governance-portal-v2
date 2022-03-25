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
    setCopied(true);
    navigator.clipboard.writeText(markdownContent);
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
              <Button onClick={copyToClipboard}>
                <Icon name="copy" mr={2} color="white" size={10} />
                Copy &amp; paste on the forum
              </Button>
              {/* <Button>Download markdown file</Button> */}
            </Flex>
            <Flex sx={{ alignItems: 'center', justifyContent: 'center', mt: 2, height: '10px' }}>
              {copied && (
                <>
                  <Text sx={{ color: 'primary', fontSize: 2, mr: 2 }}>Copied!</Text>
                  <Icon name="checkmark" size={10} color={'primary'} />
                </>
              )}
            </Flex>
          </Flex>
        </BoxWithClose>
      </DialogContent>
    </DialogOverlay>
  );
};
