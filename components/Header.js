/** @jsx jsx */
import Link from 'next/link';
import { Box, Flex, Heading, NavLink, jsx } from 'theme-ui';

const Header = () => (
  <Flex as="header" variant="styles.header" my={3}>
    <Link as="/" href="/">
      <Heading
        as="h1"
        fontSize={3}
        variant="styles.heading"
        sx={{ cursor: 'pointer' }}
      >
        M
      </Heading>
    </Link>

    <Box ml="auto">
      <Link href="/polling">
        <NavLink p={2} variant="styles.navlink">
          Polling
        </NavLink>
      </Link>
      <Link href="/executive">
        <NavLink p={2} variant="styles.navlink">
          Executive
        </NavLink>
      </Link>
    </Box>
  </Flex>
);

export default Header;
