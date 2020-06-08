import { Link as ExternalLink, Text, Card, Flex } from 'theme-ui';

type Props = {
  title: string;
  linkText: string;
  linkDest?: string;
  icon?: React.ReactNode;
  children: React.ReactNode;
};

const IntroCard = (props: Props) => (
  <Card sx={{ minWidth: 348, maxWidth: 348, border: "0px solid black", boxShadow: 'none'}}>
    {props.icon}
    <Flex sx={{ flexDirection: 'column', justifyContent: 'flex-start', height: '9rem'}}>
      <Text
        sx={{
          fontSize: [3, 4],
          color: '#231536',
          textAlign: 'left'
        }}
        mb="3"
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
        mb="4"
      >
        {props.children}
      </Text>
    </Flex>
    <ExternalLink
      sx={{ color: 'primary', fontSize: '3', fontWeight: '500' }}
      href={props.linkDest}
      target="_blank"
    >
      {props.linkText}
    </ExternalLink>
  </Card>
);

export default IntroCard;
