/*

SPDX-FileCopyrightText: © 2023 Dai Foundation <www.daifoundation.org>

SPDX-License-Identifier: AGPL-3.0-or-later

*/

// Content-Security-Policy for the portal pages. Plain CommonJS because next.config.js requires it.
const crypto = require('crypto');
const { COLOR_MODE_SCRIPT } = require('./colorModeScript');

const COLOR_MODE_SCRIPT_HASH = `'sha256-${crypto
  .createHash('sha256')
  .update(COLOR_MODE_SCRIPT)
  .digest('base64')}'`;

const DEFAULT_PROXY_ORIGIN = 'https://staging-proxy.sky.money';

// Hosts the browser talks to directly. Server-side fetches (API routes, getStaticProps) are not
// subject to the CSP and don't belong here.
const CONNECT_SRC_HOSTS = [
  // Safe transaction service, used to resolve Safe tx hashes
  'https://safe-transaction-mainnet.safe.global',
  'https://safe-transaction-arbitrum.safe.global',
  // MKR liquidity sidebar
  'https://gateway-arbitrum.network.thegraph.com',
  // WalletConnect relay, verify and wallet explorer APIs
  'https://*.walletconnect.com',
  'wss://*.walletconnect.com',
  'https://*.walletconnect.org',
  'wss://*.walletconnect.org',
  'https://api.web3modal.org',
  // Coinbase Wallet SDK
  'https://*.coinbase.com',
  'wss://www.walletlink.org',
  // MetaMask SDK
  'https://*.metamask.io',
  'wss://*.metamask.io'
];

// Tenderly mainnet vnets: RPC_TENDERLY and the fork used by `dev:mock` (tenderlyTestnetData.json)
const TENDERLY_ORIGINS = ['https://virtual.mainnet.rpc.tenderly.co'];
// viem's default Arbitrum Sepolia RPC, used when NEXT_PUBLIC_RPC_ARBITRUM_TESTNET is unset
const DEFAULT_ARBITRUM_TESTNET_RPC = 'https://sepolia-rollup.arbitrum.io/rpc';

const originOf = url => {
  try {
    return new URL(url).origin;
  } catch {
    return null;
  }
};

/**
 * The enforced policy.
 * @param {object} options
 * @param {boolean} options.dev `next dev`: allows eval and inline scripts for hot reloading, and
 *   plain http/ws connections to local nodes and indexers.
 */
function buildContentSecurityPolicy({ dev }) {
  const directives = {
    'default-src': ["'self'"],
    // With a hash in the list browsers ignore 'unsafe-inline', so dev gets one or the other.
    // cdn.vercel-insights.com only serves the debug analytics script, which loads in dev.
    'script-src': dev
      ? ["'self'", "'unsafe-eval'", "'unsafe-inline'", 'https://cdn.vercel-insights.com']
      : ["'self'", COLOR_MODE_SCRIPT_HASH],
    'style-src': ["'self'", "'unsafe-inline'"],
    // blob: for the wallet icons the WalletConnect modal renders from fetched images
    'img-src': ["'self'", 'https:', 'data:', 'blob:'],
    'font-src': ["'self'", 'data:'],
    'connect-src': ["'self'", 'https:', 'wss:', ...(dev ? ['http://localhost:*', 'ws://localhost:*'] : [])],
    'frame-src': [
      'https://player.vimeo.com',
      'https://verify.walletconnect.com',
      'https://verify.walletconnect.org'
    ],
    'object-src': ["'none'"],
    'base-uri': ["'self'"],
    'form-action': ["'self'"],
    // Only the portal itself and the Safe{Wallet} app (the portal runs as a Safe App) may frame it.
    'frame-ancestors': ["'self'", 'https://app.safe.global']
  };

  return Object.entries(directives)
    .map(([directive, sources]) => `${directive} ${sources.join(' ')}`)
    .join('; ');
}

/**
 * A connect-src allowlist to trial as Content-Security-Policy-Report-Only before it replaces the
 * open https:/wss: in the enforced policy. It holds only connect-src, so nothing else is reported.
 * @param {object} options
 * @param {boolean} options.testChains Build that exposes the Tenderly and Arbitrum testnet chains.
 * @param {object} options.env Environment to read the RPC origins from.
 */
function buildConnectSrcTrialPolicy({ testChains, env }) {
  const sources = [
    "'self'",
    originOf(env.NEXT_PUBLIC_PROXY_ORIGIN || DEFAULT_PROXY_ORIGIN),
    ...CONNECT_SRC_HOSTS,
    ...(testChains
      ? [...TENDERLY_ORIGINS, originOf(env.NEXT_PUBLIC_RPC_ARBITRUM_TESTNET || DEFAULT_ARBITRUM_TESTNET_RPC)]
      : [])
  ];

  return `connect-src ${sources.filter(Boolean).join(' ')}`;
}

module.exports = { buildContentSecurityPolicy, buildConnectSrcTrialPolicy };
