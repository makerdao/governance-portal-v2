import { Text, Alert } from 'theme-ui';
import { keyframes } from '@emotion/react';

const scroll = keyframes({
  from: { transform: 'translate(60vw, 0)' },
  to: { transform: 'translate(-60vw, 0)' }
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
        <Text
          sx={{
            m: 'auto',
            fontSize: 2,
            fontWeight: 'body',
            animation: `${scroll} 30s linear infinite`
          }}
        >
          {content}
        </Text>
      ) : (
        content
      )}
    </Alert>
  );
};

export default Banner;
