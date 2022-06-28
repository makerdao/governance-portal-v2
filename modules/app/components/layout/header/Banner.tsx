import { Text, Alert } from 'theme-ui';
import { keyframes } from '@emotion/react';

const scroll = keyframes({
  from: { transform: 'translate(60vw, 0)' },
  to: { transform: 'translate(-60vw, 0)' }
});

const Banner = ({
  content,
  variant = 'banner'
}: {
  content: string | React.ReactElement;
  variant?: string;
}): React.ReactElement => {
  return (
    <Alert
      variant={variant}
      sx={{
        px: 0
      }}
    >
      {typeof content === 'string' ? (
        <Text
          sx={{
            m: 'auto',
            fontSize: 2,
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
