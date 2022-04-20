import { Text, Alert } from 'theme-ui';
import { keyframes } from '@emotion/react';

const fadeIn = keyframes({
  from: { transform: 'translate(0, 0)' },
  to: { transform: 'translate(-100%, 0)' }
});

const Banner = ({ content }: { content: string | React.ReactElement }): React.ReactElement => {
  return (
    <Alert
      variant="banner"
      sx={{
        px: 0
      }}
    >
      {typeof content === 'string' ? (
        <Text sx={{ m: 'auto', fontSize: 2, fontWeight: 'body', animation: `${fadeIn} 5s linear infinite` }}>
          {content}
        </Text>
      ) : (
        content
      )}
    </Alert>
  );
};

export default Banner;
