import { useEffect, useRef } from 'react';

export default function useInterval(callback: () => void, delay: number) {
  const savedCallback = useRef(callback);

  useEffect(() => {
    savedCallback.current = callback;
  }, [callback]);

  useEffect(() => {
    if (typeof delay === 'number') {
      const id = setInterval(savedCallback.current, delay);
      return () => clearInterval(id);
    }
  }, [delay]);
}
