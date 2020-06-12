import { Box, Link as ExternalLink, Text, Flex } from 'theme-ui';

type Props = {
  title: string;
  linkText: string;
  linkDest?: string;
  icon?: React.ReactNode;
  children: React.ReactNode;
};

const IntroCard = (props: Props) => (
  <Box sx={{ width: 7 }}>
    {props.icon}
    <Flex sx={{ flexDirection: 'column', justifyContent: 'space-between', height: [null, '9rem'] }}>
      <Text
        sx={{
          fontSize: [3, 4],
          textAlign: 'left'
        }}
      >
        {props.title}
      </Text>
      <Text
        sx={{
          fontSize: [3, 4],
          opacity: 0.8,
          whiteSpace: 'initial'
        }}
        my="3"
      >
        {props.children}
      </Text>
      <ExternalLink
        sx={{ color: 'primary', fontSize: '3', fontWeight: 'semiBold' }}
        href={props.linkDest}
        target="_blank"
      >
        {props.linkText}
      </ExternalLink>
    </Flex>
  </Box>
);

export default IntroCard;
