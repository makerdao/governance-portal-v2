import { useContext } from 'react';
import { MakerObjectContext } from '../providers/MakerProvider';

export default function useMaker() {
  return useContext(MakerObjectContext) || {};
}
