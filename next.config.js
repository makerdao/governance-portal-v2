const path = require('path');
const { PHASE_PRODUCTION_BUILD } = require('next/constants');

require('dotenv').config({ path: './.env' });

const securityHeaders = [
  // Adds x-xss-protection
  {
    key: 'X-XSS-Protection',
    value: '1; mode=block'
  },

  // adds x-frame-options
  // remove for safe app to load
  // {
  //   key: 'X-Frame-Options',
  //   value: 'SAMEORIGIN'
  // },

  // adds frame-ancestors which supercedes X-Frame-Options
  // https://nextjs.org/docs/advanced-features/security-headers#x-frame-options
  {
    key: 'frame-ancestors',
    value: 'https://app.safe.global'
  },

  // adds x-content-type
  {
    key: 'X-Content-Type-Options',
    value: 'nosniff'
  },

  // required for safe app to load
  {
    key: 'Access-Control-Allow-Origin',
    value: '*'
  },

  {
    key: 'Access-Control-Allow-Methods',
    value: 'GET'
  },

  {
    key: 'Access-Control-Allow-Headers',
    value: 'X-Requested-With, content-type, Authorization'
  }
];

//// Main Next.js config
const moduleExports = {
  // everything in here gets exposed to the frontend.
  // prefer NEXT_PUBLIC_* instead, which makes this behavior more explicit
  env: {
    READ_ONLY: process.env.READ_ONLY
  },

  // Opt-in SWC minification (next 12.0.2)
  // swcMinify: true, // fatal runtime error: failed to initiate panic, error 5

  webpack: (config, { isServer }) => {
    if (!isServer) {
      // Fixes npm packages that depend on `fs` module
      // https://github.com/vercel/next.js/issues/7755#issuecomment-508633125
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        dns: false,
        net: false,
        tls: false
      };
    }
    // @metamask/sdk (via @wagmi/connectors) lazily imports react-native async storage; not used in web.
    config.resolve.alias['@react-native-async-storage/async-storage'] = false;
    config.resolve.alias['lib'] = path.join(__dirname, 'lib');
    config.resolve.alias['components'] = path.join(__dirname, 'components');
    config.resolve.alias['stores'] = path.join(__dirname, 'stores');

    return config;
  },

  async rewrites() {
    return [
      {
        source: '/delegates/:address',
        destination: '/address/:address'
      },
      {
        source: '/api/delegates',
        destination: '/api/delegates/v1'
      }
    ];
  },

  async headers() {
    return [
      {
        // Apply these headers to all routes in your application.
        source: '/:path*',
        headers: securityHeaders
      }
    ];
  },

  staticPageGenerationTimeout: 120
};

// Production must name its proxy explicitly instead of falling back to the staging proxy
// (modules/app/constants/proxy.ts), and any proxy that is set must be a full http(s) URL.
function checkProxyOrigin() {
  const proxyOrigin = process.env.NEXT_PUBLIC_PROXY_ORIGIN;

  if (!proxyOrigin) {
    if (process.env.NEXT_PUBLIC_VERCEL_ENV === 'production') {
      throw new Error('NEXT_PUBLIC_PROXY_ORIGIN must be set for production builds');
    }
    return;
  }

  let protocol;
  try {
    ({ protocol } = new URL(proxyOrigin));
  } catch {
    protocol = undefined;
  }
  if (protocol !== 'https:' && protocol !== 'http:') {
    throw new Error(`NEXT_PUBLIC_PROXY_ORIGIN must be an http(s) URL, got "${proxyOrigin}"`);
  }
}

module.exports = phase => {
  if (phase === PHASE_PRODUCTION_BUILD) {
    checkProxyOrigin();
  }

  return moduleExports;
};
