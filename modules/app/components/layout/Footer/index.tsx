import React from 'react';
import ShortFooter from './ShortFooter';
import LandingFooter from 'modules/home/components/LandingFooter';

export default function Footer({ shorten = false }: { shorten: boolean }): React.ReactElement {
  if (shorten) {
    return <ShortFooter />;
  } else {
    return <LandingFooter />;
  }
}
