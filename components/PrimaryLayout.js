import { Box, Container } from 'theme-ui';

import Header from './Header';

const PrimaryLayout = ({ children }) => (
  <Container mx="auto" px={4}>
    <Header />
    <Box as="main">{children}</Box>
    {/* <Footer  /> */}
  </Container>
);

export default PrimaryLayout;
