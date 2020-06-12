import { Box } from 'theme-ui';
import { useEffect, useState } from 'react';

/**
 * Hides children until timer is up
 */
const Delay = ({ children, wait = 100 }: React.PropsWithChildren<{ wait?: number }>) => {
  const [waiting, setWaiting] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setWaiting(false);
    }, wait);
    return () => clearTimeout(timer);
  }, []);

  if (!waiting) return <>{children}</>;
  return <Box sx={{ visibility: 'hidden' }}>{children}</Box>;
};

export default Delay;
