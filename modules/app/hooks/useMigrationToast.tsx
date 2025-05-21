import { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import { SkyUpgradeToastContent } from '../components/SkyUpgradeToastContent';
import { useBreakpointIndex } from '@theme-ui/match-media';

export function useMigrationToast(): void {
  const bpi = useBreakpointIndex();
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    // Only show toast on client-side
    if (!isClient) return;

    // Check if the toast has already been shown in this session
    const toastShown = localStorage.getItem('skyUpgradeToastShown');

    if (!toastShown) {
      toast(<SkyUpgradeToastContent />, {
        ariaLabel: 'Sky Governance Migration Notice',
        autoClose: false,
        closeOnClick: false,
        draggable: false,
        toastId: 'sky-upgrade-banner-toast',
        progressClassName: 'progress-bar',
        style: {
          background: 'rgba(255, 255, 255, 0.6)',
          backdropFilter: 'blur(12px)',
          WebkitBackdropFilter: 'blur(12px)',
          color: '#231536', // text
          width: bpi === 0 ? '80%' : '40%',
          borderRadius: '12px',
          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)'
        }
      });

      // Mark the toast as shown for this session
      localStorage.setItem('skyUpgradeToastShown', 'true');
    }
  }, [isClient]);
}
