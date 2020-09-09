/** @jsx jsx */
import { jsx } from 'theme-ui';
import { useEffect, useRef } from 'react';
import { Box } from 'theme-ui';
import dynamic from 'next/dynamic';

const ICON_SIZE = 22;

type AccountIconProps = { account: string; mr: number };

export default dynamic(
  async () => {
    const { default: jazzicon } = await import('jazzicon');
    return ({ account, mr, ...props }: AccountIconProps) => {
      const iconParent = useRef<HTMLDivElement>(null);

      useEffect(() => {
        if (!account || !iconParent.current || typeof window === 'undefined') return;
        const parent: HTMLDivElement = iconParent.current;
        if (parent.firstChild) parent.removeChild(parent.firstChild);
        parent.appendChild(jazzicon(ICON_SIZE, parseInt(account.slice(2, 10), 16)));
      }, [account]);

      return <Box {...props} ref={iconParent} sx={{ height: ICON_SIZE, mr }}></Box>;
    };
  },
  { ssr: false }
);
