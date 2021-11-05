const path = require('path');

require('dotenv').config({ path: './.env' });

// This file sets a custom webpack configuration to use your Next.js app
// with Sentry.
// https://nextjs.org/docs/api-reference/next.config.js/introduction
// https://docs.sentry.io/platforms/javascript/guides/nextjs/
const { withSentryConfig } = require('@sentry/nextjs');

// Main Next.js config
const moduleExports = {
  // everything in here gets exposed to the frontend.
  // prefer NEXT_PUBLIC_* instead, which makes this behavior more explicit
  env: {
    INFURA_KEY: process.env.INFURA_KEY || '84842078b09946638c03157f83405213', // ethers default infura key
    ALCHEMY_KEY: process.env.ALCHEMY_KEY || '_gg7wSSi0KMBsdKnGVfHDueq6xMB9EkC', // ethers default alchemy key
    USE_PROD_SPOCK: process.env.USE_PROD_SPOCK // use production spock instance if true, otherwise use staging
  },

  // Opt-in SWC minification (next 12.0.2)
  // swcMinify: true, // fatal runtime error: failed to initiate panic, error 5
  
  // Fix Sentry error https://github.com/getsentry/sentry-javascript/issues/4103
  outputFileTracing: false,

  webpack: (config, { isServer }) => {
    if (isServer) {
      process.env.USE_FS_CACHE = 1;
    } else {
      // Fixes npm packages that depend on `fs` module
      // https://github.com/vercel/next.js/issues/7755#issuecomment-508633125
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false
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
  }
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
