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

*Requires node version >= v11.15.0*

### Environment (optional)

1. Create a local `.env` file
3. Set `INFURA_KEY` to a valid Infura API key 
3. Set `ALCHEMY_KEY` to a valid Alchemy API key 

If API keys aren't provided, both Alchemy and Infura will default to the public keys from [ethers.js](https://github.com/ethers-io/ethers.js/). This is probably fine in most cases, performance is could just be a bit less consistent as many people are using these.
