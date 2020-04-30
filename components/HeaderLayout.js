import Link from 'next/link';
import { Container, Flex, Heading, NavLink } from 'theme-ui';

const HeaderLayout = (props) => (
  <Container>
    <Flex variant="flex.header">
      <Heading>Maker</Heading>
      <Flex as="nav">
        <Link href="/executive">
          <NavLink>Executive</NavLink>
        </Link>
        <Link href="/poll">
          <NavLink>Polling</NavLink>
        </Link>
      </Flex>
    </Flex>
    {props.children}
  </Container>
);

export default HeaderLayout;
