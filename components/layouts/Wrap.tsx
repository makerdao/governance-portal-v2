import React from 'react';
import { Box, Flex } from 'theme-ui';
import { styledClone } from 'lib/utils';
import theme from 'lib/theme';

type Props = {
  children: React.ReactNode;
  gap?: number | number[];
  justifyContent?: string;
  // set this if you want to wrap for some, but not all, breakpoints
  breakpoints?: boolean[];
};

function halve(gap: number | number[], negate?: boolean): number | number[] {
  const f = val => (theme.sizes[val] / 2) * (negate ? -1 : 1);
  return typeof gap === 'number' ? f(gap) : gap.map(f);
}

const WrapLayout = React.forwardRef<any, Props>(
  ({ children, gap = 4, justifyContent = 'flex-start', breakpoints, ...props }, ref) => (
    <Box {...props}>
      <Flex
        ref={ref}
        sx={{
          flexWrap: breakpoints ? breakpoints.map(x => (x ? 'wrap' : 'nowrap')) : 'wrap',
          justifyContent,
          alignItems: 'center',
          flexDirection: 'row',
          m: halve(gap, true)
        }}
      >
        {React.Children.map(children, child => styledClone(child, { sx: { m: halve(gap), flex: 'auto' } }))}
      </Flex>
    </Box>
  )
);

export default WrapLayout;
