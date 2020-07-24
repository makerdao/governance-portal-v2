import { useThemeUI } from '@theme-ui/core';
import { useState, useEffect } from 'react';
import debounce from 'lodash/debounce';

const isEm = x => typeof x === 'string' && x.endsWith('em');

const pxValue = (breakpoint: string): number => {
  if (isEm(breakpoint)) {
    const emSize = parseFloat(getComputedStyle(document.body).fontSize);
    return emSize * parseFloat(breakpoint);
  }
  // we assume here that if the value isn't ems, it's pixels
  return parseFloat(breakpoint);
};

const currentBreakpoint = {
  value: -1,
  listeners: [],
  observe(callback: (num: number) => void) {
    this.listeners.push(callback);
    callback(this.value);
  },
  stopObserving(callback) {
    this.listeners.splice(this.listeners.indexOf(callback), 1);
  },
  start(breakpoints) {
    const update = value => {
      if (this.value !== value) {
        this.value = value;
        this.listeners.forEach(l => l(this.value));
      }
    };

    const calc = () => {
      const width = window.innerWidth;
      for (const newIndex in breakpoints) {
        if (width < pxValue(breakpoints[newIndex])) return update(parseInt(newIndex));
      }
      return update(breakpoints.length);
    };

    window.addEventListener('resize', debounce(calc, 200));
    calc();
  }
};

export function useBreakpoints(): number {
  const {
    theme: { breakpoints }
  } = useThemeUI();
  let [index, setIndex] = useState<number>(currentBreakpoint.value);

  useEffect(() => {
    currentBreakpoint.observe(setIndex);
    return () => currentBreakpoint.stopObserving(setIndex);
  }, []);

  if (typeof window !== 'undefined' && currentBreakpoint.value === -1) {
    currentBreakpoint.start(breakpoints);
    index = currentBreakpoint.value;
  }

  return index;
}
