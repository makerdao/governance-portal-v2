import { AllDelegatesEntryWithName } from '../types';

export default function getDelegatesCounts(allDelegatesWithNames: AllDelegatesEntryWithName[]): {
  recognizedDelegatesCount: number;
  shadowDelegatesCount: number;
  totalDelegatesCount: number;
} {
  const rawRecognizedDelegates = allDelegatesWithNames.filter(delegate => !delegate.expired && delegate.name);

  const recognizedDelegatesCount = new Set(rawRecognizedDelegates.map(delegate => delegate.name)).size;
  const shadowDelegatesCount = allDelegatesWithNames.length - rawRecognizedDelegates.length;
  const totalDelegatesCount = recognizedDelegatesCount + shadowDelegatesCount;

  return { recognizedDelegatesCount, shadowDelegatesCount, totalDelegatesCount };
}
