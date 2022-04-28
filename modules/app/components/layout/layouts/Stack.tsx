import React from 'react';
import { Flex, ThemeUIStyleObject } from 'theme-ui';
import { styledClone } from 'lib/utils';
import { ThemeUICSSProperties } from '@theme-ui/css';

type Props = ThemeUICSSProperties & {
  children: React.ReactNode;
  gap?: number | number[];
  sx?: ThemeUIStyleObject;
  separationType?: 'm' | 'p';
};

const StackLayout = React.forwardRef<any, Props>(
  ({ children, gap = 4, separationType = 'm', ...props }, ref) => (
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
        .map((child, i) =>
          styledClone(child, { sx: { [separationType === 'm' ? 'mt' : 'pt']: i == 0 ? undefined : gap } })
        )}
    </Flex>
  )
);

export default StackLayout;
