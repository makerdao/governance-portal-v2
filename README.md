[![All Contributors](https://img.shields.io/badge/all_contributors-7-orange.svg?style=flat-square)](#contributors)

<h1 align="center" style="margin-top: 1em; margin-bottom: 3em;">
  <p><a href="https://vote.makerdao.com/"><img alt="maker logo" src="./maker-logo.png" alt="vote.makerdao.com" width="125"></a></p>
  <p> <img src="https://media.giphy.com/media/hvRJCLFzcasrR4ia7z/giphy.gif" alt="Waving Hand" width="25px"> Maker Governance Portal</p>
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
7. Set `USE_PROD_SPOCK` to true to use the production spock instance
8. Set `GITHUB_TOKEN` to fetch delegates information from GitHub
9. Set `GITHUB_DELEGATES_OWNER` to indicate the owner of the delegates repo
10. Set `GITHUB_DELEGATES_REPO` to indicate the name of the repo that contains the delegates folder

If API keys aren't provided, both Alchemy and Infura will default to the public keys from [ethers.js](https://github.com/ethers-io/ethers.js/). This is probably fine in most cases, performance could just be a bit less consistent as many people are using these.

### Contributing

See our [contributing guide](./CONTRIBUTING.md)
