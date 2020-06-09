import { Box, Link as ExternalLink, Text, Flex } from 'theme-ui';

type Props = {
  title: string;
  linkText: string;
  linkDest?: string;
  icon?: React.ReactNode;
  children: React.ReactNode;
};

const IntroCard = (props: Props) => (
  <Box sx={{ width: 348, mb: [4, null] }}>
    {props.icon}
    <Flex sx={{ flexDirection: 'column', justifyContent: 'space-between', height: '9rem'}}>
      <Text
        sx={{
          fontSize: [3, 4],
          color: '#231536',
          textAlign: 'left'
        }}
      >
        {props.title}
      </Text>
      <Text
        sx={{
          fontSize: [3, 4],
          color: 'text',
          opacity: 0.8,
          whiteSpace: 'initial'
        }}
        my="3"
      >
        {props.children}
      </Text>
      <ExternalLink
        sx={{ color: 'primary', fontSize: '3', fontWeight: '500' }}
        href={props.linkDest}
        target="_blank"
        >
        {props.linkText}
      </ExternalLink>
    </Flex>
  </Box>
);

export default IntroCard;
