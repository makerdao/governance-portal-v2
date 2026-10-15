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
const RPC_TENDERLY_ORIGIN = 'https://virtual.mainnet.rpc.tenderly.co';

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

const originOf = url => {
  try {
    return new URL(url).origin;
  } catch {
    return null;
  }
};

/**
 * @param {object} options
 * @param {boolean} options.dev `next dev`: allows eval and inline scripts for hot reloading.
 * @param {boolean} options.preview Vercel preview deployment: allows the Vercel toolbar frame.
 * @param {boolean} options.testChains Build that exposes the Tenderly and Arbitrum testnet chains.
 * @param {boolean} options.restrictConnect Lists connect-src hosts instead of allowing any https/wss host.
 * @param {object} options.env Environment to read the RPC origins from.
 */
function buildContentSecurityPolicy({ dev, preview, testChains, restrictConnect, env }) {
  const connectSrc = restrictConnect
    ? [
        "'self'",
        originOf(env.NEXT_PUBLIC_PROXY_ORIGIN || DEFAULT_PROXY_ORIGIN),
        ...CONNECT_SRC_HOSTS,
        ...(testChains ? [RPC_TENDERLY_ORIGIN, originOf(env.NEXT_PUBLIC_RPC_ARBITRUM_TESTNET)] : [])
      ]
    : ["'self'", 'https:', 'wss:'];

  const directives = {
    'default-src': ["'self'"],
    // With a hash in the list browsers ignore 'unsafe-inline', so dev gets one or the other.
    // cdn.vercel-insights.com only serves the debug analytics script, which loads in dev.
    'script-src': dev
      ? ["'self'", "'unsafe-eval'", "'unsafe-inline'", 'https://cdn.vercel-insights.com']
      : ["'self'", COLOR_MODE_SCRIPT_HASH],
    'style-src': ["'self'", "'unsafe-inline'"],
    'img-src': ["'self'", 'https:', 'data:'],
    'font-src': ["'self'", 'data:'],
    'connect-src': connectSrc,
    'frame-src': [
      'https://player.vimeo.com',
      'https://verify.walletconnect.com',
      'https://verify.walletconnect.org',
      ...(preview ? ['https://vercel.live'] : [])
    ],
    'object-src': ["'none'"],
    'base-uri': ["'self'"],
    'form-action': ["'self'"],
    // Only the portal itself and the Safe{Wallet} app (the portal runs as a Safe App) may frame it.
    'frame-ancestors': ["'self'", 'https://app.safe.global']
  };

  return Object.entries(directives)
    .map(([directive, sources]) => `${directive} ${sources.filter(Boolean).join(' ')}`)
    .join('; ');
}

module.exports = { buildContentSecurityPolicy, COLOR_MODE_SCRIPT_HASH };
