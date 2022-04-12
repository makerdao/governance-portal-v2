import React from 'react';
import { Box, ThemeUIStyleObject } from 'theme-ui';
import { keyframes } from '@emotion/react';
const spin = keyframes`
  50% { 
    transform: rotate(180deg); 
    opacity: 0.3;
  }
  100% { transform: rotate(360deg);  }
`;
function Circle({ sxs, color }: { sxs: ThemeUIStyleObject; color: string }): React.ReactElement {
  console.log(sxs);
  return (
    <Box
      sx={{
        background: `linear-gradient(180deg, ${color} 0%, #f3efbd 100%);`,
        borderRadius: '100%',
        filter: 'blur(2px)',
        transformOrigin: '80% 20%',
        animation: `${spin} 10s cubic-bezier(.8, 0, .2, 1) infinite alternate`,
        transition: 'all 300ms linear',
        ...sxs
      }}
    />
  );
}
export default function CirclesBackground({
  children,
  activeColor
}: {
  children: React.ReactNode;
  activeColor: string;
}): React.ReactElement {
  return (
    <Box
      sx={{
        position: 'relative'
      }}
    >
      <Circle
        color={activeColor}
        sxs={{
          width: '100px',
          height: '100px',
          position: 'absolute',
          left: '50%',
          top: '20px',
          zIndex: '1'
        }}
      />

      <Circle
        color={activeColor}
        sxs={{
          width: '300px',
          height: '300px',
          transform: 'rotate(-90deg)',
          position: 'absolute',
          left: '-100px',
          top: '100px',
          filter: 'blur(2px)',
          transformOrigin: '60% 60%',

          zIndex: '1'
        }}
      />

      <Circle
        color={activeColor}
        sxs={{
          width: '300px',
          height: '300px',
          transform: 'rotate(90deg)',
          position: 'absolute',
          right: '-15px',
          bottom: '0px',
          filter: 'blur(2px)',

          zIndex: '1'
        }}
      />

      <Circle
        color={activeColor}
        sxs={{
          width: '100px',
          height: '100px',
          transform: 'rotate(90deg)',
          position: 'absolute',
          right: '400px',
          bottom: '0px',
          filter: 'blur(2px)',

          zIndex: '1'
        }}
      />
      <Box sx={{ position: 'relative', pt: 3, zIndex: '10' }}>{children}</Box>
    </Box>
  );
}
