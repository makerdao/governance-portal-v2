require('dotenv').config();

module.exports = {
  // everything in here gets exposed to the frontend.
  // prefer NEXT_PUBLIC_* instead, which makes this behavior more explicit
  env: {
    INFURA_KEY: process.env.INFURA_KEY || '84842078b09946638c03157f83405213', // ethers default infura key
    ALCHEMY_KEY: process.env.ALCHEMY_KEY || '_gg7wSSi0KMBsdKnGVfHDueq6xMB9EkC', // ethers default alchemy key
    USE_PROD_SPOCK: process.env.USE_PROD_SPOCK // use production spock instance if true, otherwise use staging
  }
};
