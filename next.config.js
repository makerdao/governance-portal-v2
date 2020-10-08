require('dotenv').config();

module.exports = {
  env: {
    INFURA_KEY: process.env.INFURA_KEY || '84842078b09946638c03157f83405213', // ethers default infura key
    ALCHEMY_KEY: process.env.ALCHEMY_KEY || '_gg7wSSi0KMBsdKnGVfHDueq6xMB9EkC', // ethers default alchemy key
    TRACING_RPC_NODE: process.env.TRACING_RPC_NODE, // foundation parity node with tracing enabled
    MONGODB_URI: process.env.MONGODB_URI, // mongodb uri (currently only used for vote comments)
    MONGODB_COMMENTS_DB: process.env.MONGODB_COMMENTS_DB // mongodb db name for vote comments
  }
};
