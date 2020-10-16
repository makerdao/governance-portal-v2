<h1 align="center">
  Maker Gov Portal V2
</h1>

An open source interface for Dai Credit System governance

## Development

Install it and run:

```bash
npm install
npm run dev
# or
yarn
yarn dev
```

_Requires node version >= v11.15.0_

### Environment (optional)

1. Create a local `.env` file
2. Set `INFURA_KEY` to a valid Infura API key
3. Set `ALCHEMY_KEY` to a valid Alchemy API key
4. Set `TRACING_RPC_NODE` to an ethereum RPC parity node with tracing enabled
5. Set `MONGODB_URI` to a full mongodb uri (ex: `mongodb+srv://...`)
6. Set `MONGODB_COMMENTS_DB` the mongodb db name to be used for vote comments
6. Set `USE_PROD_SPOCK` to true to use the production spock instance

If API keys aren't provided, both Alchemy and Infura will default to the public keys from [ethers.js](https://github.com/ethers-io/ethers.js/). This is probably fine in most cases, performance is could just be a bit less consistent as many people are using these.
