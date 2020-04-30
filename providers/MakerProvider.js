import React, { createContext, useState, useEffect } from 'react';
import { instantiateMaker } from '../maker';

export const MakerObjectContext = createContext();

function MakerProvider({ children, network }) {
  const [maker, setMaker] = useState(null);
  useEffect(() => {
    if (!network) return;
    instantiateMaker(network).then(setMaker);
  }, [network]);

  return (
    <MakerObjectContext.Provider value={{ maker, network }}>
      {children}
    </MakerObjectContext.Provider>
  );
}

export default MakerProvider;
