import React from 'react';
import { Flex } from 'theme-ui';
import { styledClone } from '../../lib/utils';

const StackLayout = React.forwardRef<any, { children: React.ReactNode; gap?: number | number[] }>(
  ({ children, gap = 4, ...props }, ref) => (
    <Flex
      ref={ref}
      sx={{
        width: '100%',
        flexDirection: 'column',
        alignItems: 'stretch',
        flexWrap: 'nowrap'
      }}
      {...props}
    >
      {React.Children.map(children, (child, i) => styledClone(child, { sx: { mt: i == 0 ? null : gap } }))}
    </Flex>
  )
);

export default StackLayout;
