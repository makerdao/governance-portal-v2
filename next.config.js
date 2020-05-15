require('dotenv').config();

module.exports = {
  env: {
    INFURA_KEY: process.env.INFURA_KEY || '7d0d81d0919f4f05b9ab6634be01ee73' // ethers default infura key
  }
};
