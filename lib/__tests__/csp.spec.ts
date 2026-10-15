/*

SPDX-FileCopyrightText: © 2023 Dai Foundation <www.daifoundation.org>

SPDX-License-Identifier: AGPL-3.0-or-later

*/

import { createHash } from 'crypto';
import { renderToStaticMarkup } from 'react-dom/server';
import { InitializeColorMode } from 'theme-ui';
import { buildConnectSrcTrialPolicy, buildContentSecurityPolicy } from 'lib/csp';
import { COLOR_MODE_SCRIPT } from 'lib/colorModeScript';

const env = {
  NEXT_PUBLIC_PROXY_ORIGIN: 'https://proxy.sky.money/',
  NEXT_PUBLIC_RPC_ARBITRUM_TESTNET: 'https://arbitrum-testnet.example/rpc/key'
};

const directive = (csp: string, name: string) =>
  csp
    .split('; ')
    .find(d => d.startsWith(`${name} `))
    ?.split(' ')
    .slice(1);

describe('buildContentSecurityPolicy', () => {
  it('only lets the portal itself and Safe frame the pages', () => {
    const csp = buildContentSecurityPolicy({ dev: false });

    expect(directive(csp, 'frame-ancestors')).toEqual(["'self'", 'https://app.safe.global']);
  });

  it('allows the color mode script by the hash of the script that is rendered', () => {
    const csp = buildContentSecurityPolicy({ dev: false });
    const hash = createHash('sha256').update(COLOR_MODE_SCRIPT).digest('base64');

    expect(directive(csp, 'script-src')).toEqual(["'self'", `'sha256-${hash}'`]);
  });

  it('only allows plain http and localhost in dev', () => {
    expect(buildContentSecurityPolicy({ dev: false })).not.toMatch(/http:|ws:|localhost|127\.0\.0\.1/);
    expect(directive(buildContentSecurityPolicy({ dev: true }), 'connect-src')).toContain(
      'http://localhost:*'
    );
  });
});

describe('buildConnectSrcTrialPolicy', () => {
  it('holds only connect-src, so nothing else is reported', () => {
    const csp = buildConnectSrcTrialPolicy({ testChains: false, env });

    expect(csp.split('; ')).toHaveLength(1);
    expect(directive(csp, 'connect-src')).toContain('https://proxy.sky.money');
  });

  it('only lists the testnet RPCs when the test chains are enabled', () => {
    const prod = directive(buildConnectSrcTrialPolicy({ testChains: false, env }), 'connect-src');
    const testnet = directive(buildConnectSrcTrialPolicy({ testChains: true, env }), 'connect-src');
    const testnetDefaultArbitrum = directive(
      buildConnectSrcTrialPolicy({ testChains: true, env: {} }),
      'connect-src'
    );

    expect(prod).not.toContain('https://virtual.mainnet.rpc.tenderly.co');
    expect(prod).not.toContain('https://arbitrum-testnet.example');
    expect(testnet).toContain('https://virtual.mainnet.rpc.tenderly.co');
    expect(testnet).toContain('https://staging-gov-polling.sky.money');
    expect(prod).not.toContain('https://staging-gov-polling.sky.money');
    expect(testnet).toContain('https://arbitrum-testnet.example');
    expect(testnetDefaultArbitrum).toContain('https://sepolia-rollup.arbitrum.io');
  });
});

describe('COLOR_MODE_SCRIPT', () => {
  // Fails when a theme-ui upgrade changes how it persists or applies the color mode
  it('matches the script rendered by theme-ui', () => {
    expect(renderToStaticMarkup(InitializeColorMode())).toEqual(`<script>${COLOR_MODE_SCRIPT}</script>`);
  });
});
