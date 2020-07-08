require('dotenv').config();

module.exports = {
  webpack(config) {
    config.module.rules.push({
      test: /\.svg$/,
      issuer: {
        test: /\.(js|ts)x?$/,
      },
      use: ['@svgr/webpack'],
    });

    return config;
  },
  env: {
    INFURA_KEY: process.env.INFURA_KEY || '7d0d81d0919f4f05b9ab6634be01ee73', // ethers default infura key
    ALCHEMY_KEY: process.env.ALCHEMY_KEY || '_gg7wSSi0KMBsdKnGVfHDueq6xMB9EkC' // ethers default alchemy key
  }
};
