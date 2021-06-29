import { Box, Link as ExternalLink, Text, Flex, ThemeUIStyleObject } from 'theme-ui';
import { Icon } from '@makerdao/dai-ui-icons';

type Props = {
  title: string;
  linkDest?: string;
  icon?: string;
  children: React.ReactNode;
  sx?: ThemeUIStyleObject;
};

const IntroCard = ({ icon, title, children, linkDest, ...otherProps }: Props): JSX.Element => (
  <ExternalLink
    sx={{
      color: 'text',
      fontWeight: '400'
    }}
    href={linkDest}
    target="_blank"
  >
    <Box {...otherProps} sx={{ p: 3, border: '2px solid', borderColor: '#D4D9E180', borderRadius: 'medium' }}>
      <Flex
        sx={{
          flexDirection: 'row',
          justifyContent: 'space-between'
        }}
      >
        <Icon name={icon} size="4" />
        <Icon ml="2" name="arrowTopRight" size="2" color="onSecondary" />
      </Flex>
      <Flex sx={{ flexDirection: 'column', justifyContent: 'flex-start', height: [null, 'auto'] }}>
        <Text mt="2" mb="1" sx={{ fontSize: [4, 5], textAlign: 'left', fontWeight: ['500', '400'] }}>
          {title}
        </Text>
        <Text sx={{ fontSize: [2, 3], color: 'textSecondary', whiteSpace: 'initial' }}>{children}</Text>
      </Flex>
    </Box>
  </ExternalLink>
);

export default IntroCard;
