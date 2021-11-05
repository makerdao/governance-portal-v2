import { Box, Close } from 'theme-ui';

export const BoxWithClose = ({ content, close, ...props }): JSX.Element => (
  <Box sx={{ position: 'relative' }} {...props}>
    <Close
      aria-label="close"
      sx={{
        height: 4,
        width: 4,
        position: 'absolute',
        top: '-17px',
        right: '-42px',
        display: ['none', 'block'],
        outline: 'none'
      }}
      onClick={close}
    />
    {content}
  </Box>
);

export default BoxWithClose;
