import { GetStaticProps, InferGetStaticPropsType } from 'next';

import { createSwaggerSpec } from 'next-swagger-doc';
// TODO: swagger-ui-react makes the governance portal to crash
// explore alternatives

const ApiDoc = ({ spec }: InferGetStaticPropsType<typeof getStaticProps>) => {

  return (<div id="swagger">{JSON.stringify(spec, null, 2)}</div>)
};

export const getStaticProps: GetStaticProps = async ctx => {
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
