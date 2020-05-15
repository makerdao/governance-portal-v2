import { Box, Container } from 'theme-ui';

import Header from './Header';

export default function PrimaryLayout({ children }) {
  return (
    <Container mx="auto" px={4}>
      <Header />
      <Box as="main">{children}</Box>
      {/* <Footer /> */}
    </Container>
  );
}
