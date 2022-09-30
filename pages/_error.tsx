import ErrorPage from 'modules/app/components/ErrorPage';

function Error({ statusCode }): React.ReactElement {
  return (
    <ErrorPage statusCode={statusCode} title={statusCode === 404 ? 'Page not found' : 'Unexpected error'} />
  );
}

Error.getInitialProps = ({ res, err }) => {
  const statusCode = res ? res.statusCode : err ? err.statusCode : 404;
  return { statusCode };
};

export default Error;
