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
7. Set `USE_FS_CACHE` to true if you want to use file system cache
8. Set `GITHUB_TOKEN` to fetch delegates information from GitHub
9. Set `NEXT_PUBLIC_MIXPANEL_DEV` to the valid Mixpanel dev environment API key
10. Set `NEXT_PUBLIC_MIXPANEL_PROD` to the valid Mixpanel prod environment API key
11. Set `ALCHEMY_GOERLI_API_KEY` for the API key
12. Set `ETHERSCAN_KEY` for ethers provider to use
13. Set `POCKET_KEY` for ethers provider to use

If API keys aren't provided, both Alchemy and Infura will default to the public keys from [ethers.js](https://github.com/ethers-io/ethers.js/). This is probably fine in most cases, performance could just be a bit less consistent as many people are using these.

### Architecture Diagram

![](./architecture-diagram.png)

### Tests

The Governance portal includes two test suites: Jest and Cypress

Jest tests under the folder `__tests__` currently execute unit tests of the platform. The e2e Cypress tests are under the `cypress` folder.

#### Test Commands

Jest:

```
- npm run test -> runs Jest tests on livereload mode
- npm run test:ci -> runs all the Jest tests
```

Cypress:

```
- npm run e2e -> opens a Cypress browser for the e2e
- npm run e2e:headless -> runs e2e tests in a headless manner, for CI systems
```

#### Goerli Fork

By default, e2e tests run on a fork of Goerli. We do this because the governance contracts are deployed in Goerli for testing purposes. To run the fork of Goerli on the localhost:8545 (chain id: 31337), execute:

```
npm run hardhat
```

Note: Make sure to fill in the ALCHEMY_GOERLI_API_KEY environment variable. After the network is running you can execute `npm run e2e` to execute the test suite.

You can use this local network from MetaMask, by switching to the "localhost:8545" network, with chain ID: `31337`. In order to get a wallet with some MKR and ETH you can run the script: `npm run fund` that will send some MKR and ETH to the first 50 wallets under the `/cypress/support/constants/keypairs.json`.

**Writting E2E**:

Please refer to: https://docs.cypress.io/guides/references/best-practices and check current test examples under the cypress folder.

### CI/CD

The CI/CD system is integrated with Github Actions.

After each push the system will execute:

- Lint, verify type consistency
- Unit test, execute Jest test suite
- E2E, executy cypress test suite and record results at https://dashboard.cypress.io/projects/uckcr1/runs

```
yarn start:ci
```

The command `yarn start:ci` launches a detached process with hardhat, executes e2e in a headless mode and kills the hardhat process.

### Contributing

See our [contributing guide](./CONTRIBUTING.md)
