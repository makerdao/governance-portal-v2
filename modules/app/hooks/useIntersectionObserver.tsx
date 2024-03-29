/*

SPDX-FileCopyrightText: © 2023 Dai Foundation <www.daifoundation.org>

SPDX-License-Identifier: AGPL-3.0-or-later

*/

import { RefObject, useEffect } from 'react';

export function useIntersectionObserver(
  ref: RefObject<HTMLElement> | null,
  callback: () => void,
  rootMarging = '600px'
): void {
  useEffect(() => {
    let observer;
    if (ref?.current) {
      observer = new IntersectionObserver(
        entries => {
          if (entries.pop()?.isIntersecting) {
            callback();
          }
        },
        { root: null, rootMargin: rootMarging }
      );
      observer.observe(ref.current);
    }
    return () => {
      if (ref?.current) {
        observer?.unobserve(ref.current);
      }
    };
  }, [ref]);
}
