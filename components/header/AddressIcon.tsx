/** @jsx jsx */
import { jsx } from 'theme-ui';
import { useEffect, useRef } from 'react';
import { Box } from 'theme-ui';
import dynamic from 'next/dynamic';

const ICON_SIZE = 22;

type AccountIconProps = { address: string };

export default dynamic(
  async () => {
    const { default: jazzicon } = await import('@metamask/jazzicon');
    return ({ address, ...props }: AccountIconProps) => {
      const iconParent = useRef<HTMLDivElement>(null);

      useEffect(() => {
        if (!address || !iconParent.current || typeof window === 'undefined') return;
        const parent: HTMLDivElement = iconParent.current;
        if (parent.firstChild) parent.removeChild(parent.firstChild);
        parent.appendChild(jazzicon(ICON_SIZE, parseInt(address.slice(2, 10), 16)));
      }, [address]);

      return (
        <Box {...props}>
          <Box ref={iconParent} sx={{ height: ICON_SIZE }} />
        </Box>
      );
    };
  },
  { ssr: false }
);
