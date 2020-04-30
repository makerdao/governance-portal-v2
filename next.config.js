require('dotenv').config();

module.exports = {
  env: {
    INFURA_KEY: process.env.INFURA_KEY,
  },
  experimental: {
    reactRefresh: true,
  },
};
