type SystemConfig = {
  USE_FS_CACHE: string;
  NEXT_PUBLIC_USE_MOCK: string;
  USE_PROD_SPOCK: string;
  ALCHEMY_KEY: string;
  INFURA_KEY: string;
  TRACING_RPC_NODE: string;
  MONGODB_URI: string;
  MONGODB_COMMENTS_DB: string;
  NODE_ENV: 'development' | 'production' | 'test';
};

export const config: SystemConfig = {
  USE_FS_CACHE: process.env.USE_FS_CACHE || '',
  NEXT_PUBLIC_USE_MOCK: process.env.NEXT_PUBLIC_USE_MOCK || '',
  USE_PROD_SPOCK: process.env.USE_PROD_SPOCK || '',
  ALCHEMY_KEY: process.env.ALCHEMY_KEY || '',
  INFURA_KEY: process.env.INFURA_KEY || '',
  TRACING_RPC_NODE: process.env.TRACING_RPC_NODE || '',
  MONGODB_URI: process.env.MONGODB_URI || '',
  MONGODB_COMMENTS_DB: process.env.MONGODB_COMMENTS_DB || '',
  NODE_ENV: process.env.NODE_ENV || 'development'
};
