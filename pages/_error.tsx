import ErrorPage from 'modules/app/components/ErrorPage';
import PrimaryLayout from 'modules/app/components/layout/layouts/Primary';

function Error({ statusCode }): React.ReactElement {
  return (
    <PrimaryLayout sx={{ maxWidth: 'dashboard' }}>
      <ErrorPage statusCode={statusCode} title={statusCode === 404 ? 'Page not found' : 'Unexpected error'} />
    </PrimaryLayout>
  );
}

Error.getInitialProps = ({ res, err }) => {
  const statusCode = res ? res.statusCode : err ? err.statusCode : 404;
  return { statusCode };
};

export default Error;
