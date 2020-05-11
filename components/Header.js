import Link from 'next/link';
import { Box, Flex, Heading, NavLink } from 'theme-ui';
import { Icon } from '@makerdao/dai-ui-icons';

const Header = () => (
  <Flex as="header" variant="styles.header" my={3}>
    <Link as="/" href="/">
      <Heading as="h1" sx={{ cursor: 'pointer' }}>
        <Icon name="maker" size="4" sx={{ cursor: 'pointer' }} />
      </Heading>
    </Link>

    <Box ml="auto">
      <Link href="/polling">
        <NavLink p={2}>Polling</NavLink>
      </Link>
      <Link href="/executive">
        <NavLink p={2}>Executive</NavLink>
      </Link>
    </Box>
  </Flex>
);

export default Header;
