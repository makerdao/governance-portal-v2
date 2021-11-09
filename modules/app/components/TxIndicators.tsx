import { ThemeUIStyleObject } from 'theme-ui';
import { useEffect } from 'react';
import lottie from 'lottie-web';

import txFailedAnimation from 'lib/animation/txFailed.json';
import txSuccessAnimation from 'lib/animation/txSuccess.json';
import txPendingAnimation from 'lib/animation/txPending.json';

const Failed = ({ done, ...props }: { done?: () => void; sx?: ThemeUIStyleObject }): React.ReactElement => {
  useEffect(() => {
    const animation = lottie.loadAnimation({
      container: document.getElementById('tx-failed-animation-container') as HTMLElement,
      loop: false,
      autoplay: true,
      animationData: txFailedAnimation
    });

    done && animation.addEventListener('complete', () => setTimeout(done, 200));
  }, []);

  return <div sx={{ width: '100%' }} id="tx-failed-animation-container" {...props} />;
};

const Success = ({ done, ...props }: { done?: () => void; sx?: ThemeUIStyleObject }): React.ReactElement => {
  useEffect(() => {
    const animation = lottie.loadAnimation({
      container: document.getElementById('tx-success-animation-container') as HTMLElement,
      loop: false,
      autoplay: true,
      animationData: txSuccessAnimation
    });

    done && animation.addEventListener('complete', () => setTimeout(done, 200));
  }, []);

  return <div sx={{ width: '100%' }} id="tx-success-animation-container" {...props} />;
};

const Pending = ({ done, ...props }: { done?: () => void; sx?: ThemeUIStyleObject }): React.ReactElement => {
  useEffect(() => {
    const animation = lottie.loadAnimation({
      container: document.getElementById('tx-pending-animation-container') as HTMLElement,
      loop: true,
      autoplay: true,
      animationData: txPendingAnimation
    });

    done && animation.addEventListener('complete', () => setTimeout(done, 200));
  }, []);

  return <div sx={{ width: '100%' }} id="tx-pending-animation-container" {...props} />;
};

export default {
  Failed,
  Success,
  Pending
};
