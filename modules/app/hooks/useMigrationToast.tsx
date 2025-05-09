import React, { useEffect } from 'react';
import { toast } from 'react-toastify';
import { SkyUpgradeToastContent } from '../components/SkyUpgradeToastContent';

export function useMigrationToast(): void {
  useEffect(() => {
    // Check if the toast has already been shown in this session
    const toastShown = sessionStorage.getItem('skyUpgradeToastShown');

    if (!toastShown) {
      toast(<SkyUpgradeToastContent />, {
        autoClose: 15000,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        toastId: 'sky-upgrade-banner-toast',
        progressClassName: 'progress-bar',
        style: {
          background: 'rgba(255, 255, 255, 0.4)',
          backdropFilter: 'blur(12px)',
          WebkitBackdropFilter: 'blur(12px)',
          color: '#231536', // text
          width: '40%',
          borderRadius: '12px',
          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)'
        }
      });

      // Mark the toast as shown for this session
      sessionStorage.setItem('skyUpgradeToastShown', 'true');
    }
  }, []);
}
