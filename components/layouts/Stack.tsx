import React from 'react';
import { Flex } from 'theme-ui';
import { styledClone } from '../../lib/utils';
import { ThemeUICSSProperties } from '@theme-ui/css';

type Props = ThemeUICSSProperties & {
  children: React.ReactNode;
  gap?: number | number[];
};

const StackLayout = React.forwardRef<any, Props>(({ children, gap = 4, ...props }, ref) => (
  // @ts-ignore
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
    {React.Children.toArray(children)
      .filter(Boolean)
      .map((child, i) => styledClone(child, { sx: { mt: i == 0 ? undefined : gap } }))}
  </Flex>
));

export default StackLayout;
