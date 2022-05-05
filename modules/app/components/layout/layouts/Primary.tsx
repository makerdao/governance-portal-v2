import { Box, Flex, ThemeUIStyleObject } from 'theme-ui';
import { fadeIn } from 'lib/keyframes';
import Header from 'modules/app/components/layout/Header';
import Footer from 'modules/home/components/Footer';

type Props = {
  activePollCount?: number;
  activeProposalsCount?: number;
  fade?: boolean;
  sx?: ThemeUIStyleObject;
};

const PrimaryLayout = ({
  activePollCount,
  activeProposalsCount,
  children,
  fade = true,
  ...props
}: React.PropsWithChildren<Props>): React.ReactElement => {
  return (
    <>
      <Header activePollCount={activePollCount} activeProposalsCount={activeProposalsCount} />
      <Flex
        sx={{
          mx: 'auto',
          width: '100%',
          flexDirection: 'column',
          minHeight: '100vh',
          animation: fade ? `${fadeIn} 350ms ease` : undefined
        }}
        {...props}
      >
        <Box as="main" sx={{ width: '100%', flex: '1 1 auto', variant: 'layout.main' }}>
          {children}
        </Box>
        <Footer />
      </Flex>
    </>
  );
};

export default PrimaryLayout;
