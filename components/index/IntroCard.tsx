import { Box, Link as ExternalLink, Text, Flex } from 'theme-ui';
import { Icon } from '@makerdao/dai-ui-icons';

type Props = {
  title: string;
  linkText: string;
  linkDest?: string;
  icon?: string;
  children: React.ReactNode;
};

const IntroCard = ({ icon, title, children, linkDest, linkText, ...otherProps }: Props): JSX.Element => (
  <Box {...otherProps}>
    <Icon name={icon} size="5" />
    <Flex sx={{ flexDirection: 'column', justifyContent: 'space-between', height: [null, '7.5rem'] }}>
      <Box>
        <Text sx={{ fontSize: 5, textAlign: 'left' }}>{title}</Text>
        <Text sx={{ fontSize: 3, color: 'textSecondary', whiteSpace: 'initial' }} my="1">
          {children}
        </Text>
      </Box>
      <ExternalLink
        sx={{
          color: 'primary',
          fontSize: '3',
          fontWeight: 'semiBold',
          ':hover': { color: 'greenLinkHover' }
        }}
        href={linkDest}
        target="_blank"
      >
        {linkText}
        <Icon ml="2" name="arrowTopRight" size="2" />
      </ExternalLink>
    </Flex>
  </Box>
);

export default IntroCard;
