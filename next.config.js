const path = require('path');

require('dotenv').config({ path: './.env' });

// This file sets a custom webpack configuration to use your Next.js app
// with Sentry.
// https://nextjs.org/docs/api-reference/next.config.js/introduction
// https://docs.sentry.io/platforms/javascript/guides/nextjs/
const { withSentryConfig } = require('@sentry/nextjs');
const securityHeaders = [
  // Adds x-xss-protection
  {
    key: 'X-XSS-Protection',
    value: '1; mode=block'
  },

  // adds x-frame-options
  {
    key: 'X-Frame-Options',
    value: 'SAMEORIGIN'
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
    INFURA_KEY: process.env.INFURA_KEY || '84842078b09946638c03157f83405213', // ethers default infura key
    ALCHEMY_KEY: process.env.ALCHEMY_KEY || '_gg7wSSi0KMBsdKnGVfHDueq6xMB9EkC', // ethers default alchemy key
    ALCHEMY_KEY_DELEGATES:
      // if ALCHEMY_KEY_DELEGATES is not set, fall back to ALCHEMY_KEY
      process.env.ALCHEMY_KEY_DELEGATES || process.env.ALCHEMY_KEY || '_gg7wSSi0KMBsdKnGVfHDueq6xMB9EkC',
    POCKET_KEY: process.env.POCKET_KEY,
    ETHERSCAN_KEY: process.env.ETHERSCAN_KEY
  },

  // Opt-in SWC minification (next 12.0.2)
  // swcMinify: true, // fatal runtime error: failed to initiate panic, error 5

  // Fix Sentry error https://github.com/getsentry/sentry-javascript/issues/4103
  outputFileTracing: false,

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

const SentryWebpackPluginOptions = {
  // Additional config options for the Sentry Webpack plugin. Keep in mind that
  // the following options are set automatically, and overriding them is not
  // recommended:
  //   release, url, org, project, authToken, configFile, stripPrefix,
  //   urlPrefix, include, ignore

  silent: true // Suppresses all logs
  // For all available options, see:
  // https://github.com/getsentry/sentry-webpack-plugin#options.
};

// Make sure adding Sentry options is the last code to run before exporting, to
// ensure that your source maps include changes from all other Webpack plugins
module.exports = withSentryConfig(moduleExports, SentryWebpackPluginOptions);
