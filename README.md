<h1  align="center"  style="margin-top: 1em; margin-bottom: 3em;">

<p><a  href="https://vote.makerdao.com/"><img  alt="maker logo"  src="./maker-logo.png"  alt="vote.makerdao.com"  width="125"></a></p>

<p>Maker Governance Portal</p>

</h1>

This is the repo containing the code for the [Maker Governance Portal](https://vote.makerdao.com). The Maker Governance Portal is an open-source interface for governance of the Maker protocol. </br>Copyright [Dai Foundation](https://daifoundation.org/) 2022.

### To run locally:

While the portal is hosted by MakerDAO at https://vote.makerdao.com, it can also be run by anyone on their local machine.

In order to run the project locally, you must have the following installed on the machine:

- Node, version 14 or greater ([install](https://nodejs.dev/learn/how-to-install-nodejs))

To get started, clone the repository to the desired directory and then navigate into the project folder:

```bash
# clones repo
git clone https://github.com/makerdao/governance-portal-v2.git

# changes directory to cloned project folder
cd governance-portal-v2
```

Next, install the project's dependencies using [npm](https://docs.npmjs.com/about-npm) or [yarn](https://yarnpkg.com/getting-started):

#### Using npm:

```bash

# installs dependencies
npm install

# builds eth-sdk for interacting with contracts
npm run build-sdk

# runs the application on localhost:3000
npm run dev
```

#### Or, if using yarn:

```bash

# installs dependencies
yarn

# builds eth-sdk for interacting with contracts
yarn build-sdk

# runs the application on localhost:3000
yarn dev

```

At this point, you should be able to access the application by going to the address `http://localhost:3000` in your browser.

### Releasing

To do releases of the governance portal, please use `npm version minor` or `npm version patch` to bump the version in the package.json and create a tag.

The tag and versioning should be done on develop, and then merged to master through a PR. To push your local tag use the command `git push origin develop --follow-tags`.

### Additional configuration overview:

#### Content

The portal seeks to rely on on-chain data as much as possible and to minimize reliance on data stored on centralized servers. However, due to the large volume of data that is relevant to Maker governance, fetching this data from on-chain is both time and resource-intensive. In order to improve the user's experience, some reliance on third-party services has been added, and we recommend a few configuration steps for optimal use. These services include:

- [GitHub](https://github.com/makerdao/community/tree/master/governance) for storing markdown related to [polls](https://github.com/makerdao/community/tree/master/governance/polls), [executives](https://github.com/makerdao/community/tree/master/governance/votes), and [recognized delegates](https://github.com/makerdao/community/tree/master/governance/delegates)
- MongoDB for storing comments related to votes on polls and executives

#### Network providers

The portal uses the [ethers.js](https://github.com/ethers-io/ethers.js/) library in order to communicate with the Ethereum network. Ethers works closely with an ever-growing list of third-party providers in order to provide on-chain data to web applications. By default, ethers provides default API keys to plug in to these service providers. However, these API keys can quickly become rate-limited when too many requests are made. In order to prevent this, it is recommended that you sign up and add your own API keys to the configuration for [Alchemy](https://docs.alchemy.com/reference/ethereum-api-quickstart), [Infura](https://docs.infura.io/infura/networks/ethereum/how-to/secure-a-project/project-id), [Etherscan](https://info.etherscan.com/api-keys/), and [Pocket](https://docs.pokt.network/home/#use-pocket-networks-rpc).

Due to the large volume of data that is constantly being fetched and displayed in the portal, we use caching in order to cache various network responses for a limited amount of time. This helps to reduce the load of networking calls to various APIs. This feature can be configured to be on or off.

### Configuration steps:

To begin, create a local `.env` file in the project's root directory. The `.env.sample` file can be used as a template.

The following configuration values can be added to the `.env` file:

#### Recommended for improved performance:

- Set `INFURA_KEY` to a valid [Infura](https://docs.infura.io/infura/networks/ethereum/how-to/secure-a-project/project-id) API key for ethers provider to use

- Set `ALCHEMY_KEY` to a valid [Alchemy](https://docs.alchemy.com/reference/ethereum-api-quickstart) API key for ethers provider to use

- Set `ETHERSCAN_KEY` to a valid [Etherscan](https://info.etherscan.com/api-keys/) API key for ethers provider to use

- Set `POCKET_KEY` to a valid [Pocket](https://docs.pokt.network/home/#use-pocket-networks-rpc) API key for ethers provider to use

- Set `GITHUB_TOKEN` to fetch polls, executives, and recognized delegates information from GitHub (optionally set `GITHUB_TOKEN_2` and `GITHUB_TOKEN_3`)

- Set `MONGODB_URI` to a full MongoDB uri (ex: `mongodb+srv://...`)

- Set `MONGODB_COMMENTS_DB` the MongoDB db name to be used for vote comments

- Set `USE_CACHE` to true if you want to use cache, if `REDIS_URL` is set it will use REDIS otherwise filesystem cache

- Set `GASLESS_DISABLED` to `true` to disable gasless voting in UI (pre-check endpoint will fail)

#### Optional (DUX-specific config, no performance improvements):

- Set `GOERLI_FORK_API_KEY` to a valid [Infura](https://docs.infura.io/infura/networks/ethereum/how-to/secure-a-project/project-id) API key for Hardhat to use during e2e testing

- Set `NEXT_PUBLIC_MIXPANEL_DEV` to the valid Mixpanel dev environment API key

- Set `NEXT_PUBLIC_MIXPANEL_PROD` to the valid Mixpanel prod environment API key

- Set `MIGRATION_WEBHOOK_URL` for sending migration requests to discord

- Set `GASLESS_WEBHOOK_URL` for sending gasless vote requests to discord

16. **Optional** Set `DEFENDER_API_KEY_MAINNET` and/or `DEFENDER_API_KEY_TESTNET` to a valid OpenZeppelin Defender Relay key (used for gasless poll voting)
17. **Optional** Set `DEFENDER_API_SECRET_MAINNET` and/or`DEFENDER_API_SECRET_TESTNET` to a valid OpenZeppelin Defender Relay secret
18. **Optional** Set `ALCHEMY_ARBITRUM_KEY` to a valid Alchemy API key for the arbitrum network
19. **Optional** Set `ALCHEMY_ARBITRUM_TESTNET_KEY` to a valid Alchemy API key for the arbitrum test network
20. **Optional** Set `GASLESS_BACKDOOR_SECRET` to allow for bypassing the gasless voting eligibilty checks by anyone with the password

- Set `DASHBOARD_PASSWORD` for adding protection to the `/dashboard` route

### Architecture diagram

![](./architecture-diagram.png)

### Tests

The Governance portal includes two test suites: Jest and Cypress

Jest tests under the folder `__tests__` currently execute unit tests of the platform. The e2e Cypress tests are under the `cypress` folder.

#### Test commands

jest:

```bash
# runs jest tests on live-reload mode
npm run test

# runs all the jest tests
npm run test:ci
```

Cypress:

```bash
# opens a cypress browser for the e2e
npm run e2e

# runs e2e tests in a headless manner, for CI systems
npm run e2e:headless
```

#### Goerli fork

By default, e2e tests run on a fork of Goerli. We do this because the governance contracts are deployed in Goerli for testing purposes. We also need to start the governance polling database services in a docker container so that the database and the forked chains are in sync. Please follow these steps:

1. First we want to spin up our networks: the forked Goerli and the forked Arbitrum Testnet (for testing gasless voting). The following command will start the two networks on ports 8545 and 8546 respectively.

```bash
npm run hardhat:gasless:config
```

2. When you see the accounts & keys displayed in the terminal, you can now start the dockerized database services. You may need to pull down the latest images from docker if you don't have them. In a new terminal window type these two commands:

```bash
docker-compose pull

docker-compose up
```

This will download two images, the first is a pre-seeded postgres database containing all the data you need to get started. The second one contains the API and ETL services required to work with our tests. This allows the test database to listen for events on the testchain, and return the requested data to the frontend, just as it is done in production. Wait a few minutes for the images to download and the services to start. When you see the following message displayed it means the services are ready and you can proceed to the next step:

`"Running a GraphQL API server at http://localhost:3001"`

Note: when you're finished running tests, you can remove the docker images by running `docker-compose down`. This will reset the database to its original state the next time you run the tests.

3. Now that our testchains and our database services are running, we can start the e2e tests. Run the following command in yet another new terminal window to start cypress:

```
npm run e2e
```

Note: Make sure to fill in the `GOERLI_FORK_API_KEY` environment variable.

You can use this local network from MetaMask, by switching to the "localhost:8545" network, with chain ID: `31337`. In order to get a wallet with some MKR and ETH you can run the script: `npm run fund` that will send some MKR and ETH to the first 50 wallets under the `/cypress/support/constants/keypairs.json`.

For more information about the fund process, take a look at `/scripts/setup.js`

**Writing e2e**:

Please refer to: https://docs.cypress.io/guides/references/best-practices and check current test examples under the cypress folder.

At the beginning of each test or describe-block, we run two commands to fork the hardhat networks & reset the database. This ensures that the tests are run from a clean slate and using the same blockchain and database state beforehand. Add the functions into a `before` or `beforeEach` block like this:

```js
before(() => {
  forkNetwork(); // Restarts the blockchain & re-funds all the accounts
  resetDatabase(); // Wipes the db and starts over from its initial state
});
```

**Windows support**

If you are using Windows and WSL you will need to install XLaunch to be able to launch a client for the UI, remember to disable access control.

#### Adding Data to the DB for Tests

The docker image of the gov polling db starts out with a very minimal amount of data (to conserve space), but you may require some extra data for tests. For example, you may want to add some additional polls, or add some delegates. Most of the tables in the DB have primary key constraints to other tables, which makes manually adding data via an `UPDATE` query time consuming and unstable. The easiest way to add data in a safe way is to have the gov polling db add this data on its own, the way it's done in production. The process works like this:

1. Spock adds block information (number & hash) to a row in a database.
2. Spock extracts the transactions from the block and scans these for specific events.
3. If an event is found, the corresponding event transformer is run to handle the event data, inserting the data into tables.

So, if we want to add a specific poll, first we locate the block in which the event was emitted (use Etherscan). We add the blocknumber to the list of blocknumbers in the `docker-compose.yml` file. Adding it to the `SEED_BLOCKS` environmental var (see example below).

```yml
spock:
    image: makerdaodux/govpolldb-app:latest
    container_name: spock-test-container
    command: ['yarn', 'start-all']
    environment:
        - SEED_BLOCKS=5815619,6495082
    depends_on:
        postgres:
            condition: service_healthy
    ports: - '3001:3001'
```

Now, when the docker image is started or restarted, spock looks for the environmental variable and parses the block numbers that have been added. It then runs the process described above on each block, adding any events it finds to the respective tables.

NB: This data will not be persisted in the docker image when the image is shut down using the `docker-compose stop` command, but it will be recreated every time the ETL service is restarted, as long as it remains part of the `SEED_BLOCKS` env var.

**Future Enhancements:**

In time, this list of blocks will grow too large to maintain in this file. We can either permanently update the image with the data from these blocks, or move this list to an external file and load it into the env var that way.

### CI/CD

The CI/CD system is integrated with Github Actions.

After each push the system will execute:

- Lint, verify type consistency

- Unit test, execute Jest test suite

- E2E, executy cypress test suite and record results at https://dashboard.cypress.io/projects/uckcr1/runs

```bash
npm run start:ci
```

The command `npm run start:ci` launches a detached process with hardhat, executes e2e in a headless mode and kills the hardhat process.

### Contributing

See our [contributing guide](./CONTRIBUTING.md).
