import { GetStaticProps, InferGetStaticPropsType } from 'next';
import SwaggerUI from 'swagger-ui-react';
import 'swagger-ui-react/swagger-ui.css';

import { createSwaggerSpec } from 'next-swagger-doc';

const ApiDoc = ({ spec }: InferGetStaticPropsType<typeof getStaticProps>) => {
  return <SwaggerUI spec={spec} />;
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
