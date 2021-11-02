 

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
        href="https://makerdao.statuspage.io/"
        target="_blank"
        variant="footer"
        title="Status"
        p={2}
        sx={{ fontWeight: 400 }}
      >
        Status
      </NavLink>
      <NavLink
        href="https://discord.gg/2sWcgCDWCX"
        target="_blank"
        variant="footer"
        title="Bugs"
        p={2}
        sx={{ fontWeight: 400 }}
      >
        Support
      </NavLink>
      <div sx={{ mx: 'auto' }} />
      <div sx={{ p: 2 }}>© 2021 Maker</div>
    </footer>
  );
}
