import React from 'react';
import { Flex } from 'theme-ui';
import { styledClone } from '../../lib/utils';

type Props = {
  children: React.ReactNode;
  gap?: number | number[];
  justifyContent?: string;
};

const WrapLayout = React.forwardRef<any, Props>(
  ({ children, gap = 4, justifyContent = 'flex-start', ...props }, ref) => (
    <Flex
      ref={ref}
      sx={{
        justifyContent: justifyContent,
        alignItems: 'center',
        flexDirection: 'row',
        flexWrap: 'wrap'
      }}
      {...props}
    >
      {React.Children.map(children, child => styledClone(child, { sx: { m: gap, flex: 'auto' } }))}
    </Flex>
  )
);

export default WrapLayout;
