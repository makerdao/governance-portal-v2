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
8. Set `USE_FS_CACHE` to true if you want to use file system cache
9. Set `GITHUB_TOKEN` to fetch delegates information from GitHub
10. Set `NEXT_PUBLIC_USE_MOCK` to indicate to use mock data.
11. Set `NEXT_PUBLIC_MIXPANEL_DEV` to the valid Mixpanel dev environment API key
12. Set `NEXT_PUBLIC_MIXPANEL_PROD` to the valid Mixpanel prod environment API key

If API keys aren't provided, both Alchemy and Infura will default to the public keys from [ethers.js](https://github.com/ethers-io/ethers.js/). This is probably fine in most cases, performance could just be a bit less consistent as many people are using these.

### Architecture Diagram

![](./architecture-diagram.png)

### Tests

The Governance portal includes 2 test suite: Jest and Cypress.

Jest tests under the folder __tests__ currently execute some integration and unit tests of the platform. We are in the process of migrating to Cypress for the integration tests. You can find Cypress tests under the cypress folder.

```
- npm run test -> runs Jest tests on livereload mode
- npm run test:ci -> runs all the Jest tests
- npm run e2e -> opens a Cypress browser for the e2e
- npm run e2e:headless -> runs e2e tests in a headless manner, for CI systems
```

### Contributing

See our [contributing guide](./CONTRIBUTING.md)
