import { Box, Link as ExternalLink, Text, Flex } from 'theme-ui';
import { Icon } from '@makerdao/dai-ui-icons';

type Props = {
  title: string;
  linkText: string;
  linkDest?: string;
  icon?: string;
  children: React.ReactNode;
};

const IntroCard = ({ icon, title, children, linkDest, linkText, ...otherProps }: Props) => (
  <Box {...otherProps}>
    <Icon name={icon} size="5" />
    <Flex sx={{ flexDirection: 'column', justifyContent: 'space-between', height: [null, '9rem'] }}>
      <Text sx={{ fontSize: [5, 5], textAlign: 'left' }}>{title}</Text>
      <Text sx={{ fontSize: [3, 3], opacity: 0.8, whiteSpace: 'initial' }} my="3">
        {children}
      </Text>
      <ExternalLink
        sx={{ color: 'primary', fontSize: '3', fontWeight: 'semiBold' }}
        href={linkDest}
        target="_blank"
      >
        {linkText}
      </ExternalLink>
    </Flex>
  </Box>
);

export default IntroCard;
