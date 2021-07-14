/** @jsx jsx */

import React from 'react';
import { NavLink, jsx } from 'theme-ui';

export default function ShortFooter(): React.ReactElement {
  return (
    <footer
      sx={{
        pt: 4,
        pb: 3,
        display: 'flex',
        flexWrap: 'wrap',
        alignItems: 'center',
        variant: 'styles.footer',
        fontSize: 2
      }}
    >
      <NavLink href="/terms" variant="footer" p={1} title="Terms" sx={{ fontWeight: 400 }}>
        Terms
      </NavLink>
      <NavLink
        href="https://makerdao.com/en/privacy/"
        target="_blank"
        variant="footer"
        title="Privacy Policy"
        p={2}
        sx={{ fontWeight: 400 }}
      >
        Privacy Policy
      </NavLink>
      <NavLink
        href="https://makerdao.statuspage.io/"
        target="_blank"
        variant="footer"
        title="Status"
        p={2}
        sx={{ fontWeight: 400 }}
      >
        Status
      </NavLink>
      <div sx={{ mx: 'auto' }} />
      <div sx={{ p: 2 }}>© 2021 Maker</div>
    </footer>
  );
}
