import React from 'react';
import ShortFooter from './ShortFooter';
import LongFooter from './LongFooter';
import NewFooter from './NewFooter';

export default function Footer({ shorten = false }: { shorten: boolean }): React.ReactElement {
  return <NewFooter />;
  // if (shorten) {
  //   return <ShortFooter />;
  // } else {
  //   return <LongFooter />;
  // }
}
