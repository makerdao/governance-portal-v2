import { useEffect } from 'react';

export function useIntersectionObserver(
  element: HTMLElement | null,
  callback: () => void,
  rootMarging = '600px'
): void {
  useEffect(() => {
    let observer;
    if (element) {
      observer = new IntersectionObserver(
        entries => {
          if (entries.pop()?.isIntersecting) {
            callback();
          }
        },
        { root: null, rootMargin: rootMarging }
      );
      observer.observe(element);
    }
    return () => {
      if (element) {
        observer?.unobserve(element);
      }
    };
  }, [element, callback]);
}
