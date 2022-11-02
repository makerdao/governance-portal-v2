import PrimaryLayout from 'modules/app/components/layout/layouts/Primary';
import { GetStaticProps, InferGetStaticPropsType } from 'next';
import dynamic from 'next/dynamic';

const SwaggerUI: any = dynamic(() => import('swagger-ui-react'), { ssr: false });

import { HeadComponent } from 'modules/app/components/layout/Head';
import 'swagger-ui-react/swagger-ui.css';
import { Box, useColorMode } from 'theme-ui';
import { createSwaggerSpec } from 'next-swagger-doc';
import { useRouter } from 'next/router';
import { InternalLink } from 'modules/app/components/InternalLink';

const ApiDoc = ({ spec }: InferGetStaticPropsType<typeof getStaticProps>): JSX.Element => {
  const router = useRouter();
  const [mode] = useColorMode();

  return Object.keys(router.query).length > 0 ? (
    <Box>
      <h2>Invalid Route</h2>
      <InternalLink href="/api-docs" title="View API docs">
        <a title="See API docs">Go to the API docs</a>
      </InternalLink>
    </Box>
  ) : (
    <PrimaryLayout sx={{ maxWidth: [null, null, null, 'page', 'dashboard'] }}>
      <HeadComponent title="API Docs" />
      <Box
        sx={{
          '.swagger-ui': {
            filter: mode === 'dark' ? 'invert(88%) hue-rotate(180deg)' : 'none',
            '.highlight-code': {
              filter: mode === 'dark' ? 'invert(100%) hue-rotate(180deg)' : 'none'
            }
          }
        }}
      >
        <SwaggerUI spec={spec} />
      </Box>
    </PrimaryLayout>
  );
};

export const getStaticProps: GetStaticProps = async () => {
  const spec: Record<string, any> = createSwaggerSpec({
    title: 'Governance Portal Swagger',
    version: '0.1.0'
  });

  return {
    props: {
      spec
    }
  };
};

export default ApiDoc;
