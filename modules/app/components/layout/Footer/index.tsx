import React from 'react';
import ShortFooter from './ShortFooter';
// import LongFooter from './LongFooter';
import LandingFooter from './LandingFooter';

export default function Footer({ shorten = false }: { shorten: boolean }): React.ReactElement {
  if (shorten) {
    return <ShortFooter />;
  } else {
    return <LandingFooter />;
  }
}
