import { Box, Text } from 'theme-ui';

export default function ErrorPage({
  statusCode,
  title = 'An unexpected error has ocurred',
  children
}: {
  statusCode: number;
  title?: string;
  children?: React.ReactElement;
}): React.ReactElement {
  return (
    <Box>
      <Text>{statusCode} </Text> | {title}
      <Box>{children}</Box>
      <Box>
        <Text>For more information or help contact the Development and UX core unit at : Discord</Text>
      </Box>
    </Box>
  );
}
