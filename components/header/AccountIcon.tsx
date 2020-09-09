import { useEffect, useRef } from 'react';
import { Box } from 'theme-ui';
import dynamic from 'next/dynamic';

type AccountIconProps = { account: string };

export default dynamic(
  async () => {
    const { default: jazzicon } = await import('jazzicon');
    return ({ account, ...props }: AccountIconProps) => {
      const iconParent = useRef<HTMLDivElement>(null);

      useEffect(() => {
        if (!account || !iconParent.current || typeof window === 'undefined') return;
        const parent: HTMLDivElement = iconParent.current;
        if (parent.firstChild) parent.removeChild(parent.firstChild);
        parent.appendChild(jazzicon(22, parseInt(account.slice(2, 10), 16)));
      }, [account]);

      return <Box {...props} ref={iconParent}></Box>;
    };
  },
  { ssr: false }
);
