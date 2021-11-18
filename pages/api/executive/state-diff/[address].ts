import invariant from 'tiny-invariant';
import { NextApiRequest, NextApiResponse } from 'next';
import { ethers } from 'ethers';

import { getTrace } from 'lib/api/utils';
import { ETH_TX_STATE_DIFF_ENDPOINT, SupportedNetworks } from 'lib/constants';
import { fetchJson } from 'lib/fetchJson';
import withApiHandler from 'lib/api/withApiHandler';
import { config } from 'lib/config';
import getMaker from 'lib/maker';

export default withApiHandler(async (req: NextApiRequest, res: NextApiResponse) => {
  console.log('SPELLE FFECTS');
  // const spellAddress: string = req.query.address as string;
  // invariant(spellAddress && ethers.utils.isAddress(spellAddress), 'valid spell address required');

  // invariant(
  //   !req.query.network || req.query.network === SupportedNetworks.MAINNET,
  //   `unsupported network ${req.query.network}`
  // );

  // const spellAddress = '0xad92310c5e1b3622ab6987917d6a074bca428e61'; //the one from example
  const spellAddress = '0x82b24156f0223879aaaC2DD0996a25Fe1FF74e1a'; // nov 11

  const network = SupportedNetworks.MAINNET;
  const maker = await getMaker(network);

  const { MCD_PAUSE, MCD_PAUSE_PROXY } = maker.service('smartContract').getContractAddresses();
  const provider = ethers.getDefaultProvider(network, {
    infura: config.INFURA_KEY,
    alchemy: config.ALCHEMY_KEY
  });

  // console.log(config.INFURA_KEY, config.ALCHEMY_KEY, 'infura and alchemy keys state diff');
  const encoder = new ethers.utils.Interface([
    'function sig() returns (bytes)',
    'function action() returns (address)',
    'function done() returns (bool)',
    'function exec(address, bytes)',
    'function actions()'
  ]);

  async function ethCall(method, to = spellAddress) {
    const calldata = {
      to,
      data: encoder.encodeFunctionData(method)
    };

    return encoder.decodeFunctionResult(method, await provider.call(calldata));
  }

  const [hasBeenCast] = await ethCall('done');

  console.log('^^^has been cast', hasBeenCast);
  const [usr] = await ethCall('action');

  console.log('^^^usr2', usr);

  let trace;
  // const executedOn: number | null = null;

  // if (hasBeenCast) {
  //   const pauseExecSelector = `${ethers.utils
  //     .id('exec(address,bytes32,bytes,uint256)')
  //     .slice(0, 10)}${Array.from({ length: 56 })
  //     .map(() => '0')
  //     .join('')}`;

  //   const spellAddressBytes32 = `0x${Array.from({ length: 24 })
  //     .map(() => '0')
  //     .join('')}${spellAddress.replace('0x', '')}`;

  //   const usrBytes32 = `0x${Array.from({ length: 24 })
  //     .map(() => '0')
  //     .join('')}${usr.replace('0x', '')}`;

  //   const [{ transactionHash, blockNumber }] = await new ethers.providers.InfuraProvider(
  //     network,
  //     config.INFURA_KEY
  //   ).getLogs({
  //     address: MCD_PAUSE,
  //     fromBlock: 0,
  //     toBlock: 'latest',
  //     topics: [pauseExecSelector, spellAddressBytes32, usrBytes32]
  //   });

  //   invariant(transactionHash, `Unable to find cast transaction for spell ${spellAddress}`);
  //   trace = await getTrace('trace_replayTransaction', transactionHash, network);
  //   executedOn = blockNumber;
  // } else {
  // trace = await getTrace(
  //   'trace_call',
  //   {
  //     from: MCD_PAUSE,
  //     to: MCD_PAUSE_PROXY,
  //     data: encoder.encodeFunctionData('exec', [usr, encoder.encodeFunctionData('actions')])
  //   },
  //   network
  // );
  // }

  const data2 = encoder.encodeFunctionData('exec', [usr, encoder.encodeFunctionData('actions')]);
  console.log('^^^data3', data2);

  // console.log(trace, 'trace');
  // invariant(trace, `Unable to fetch trace for spell ${spellAddress}`);

  //needs to be from pause? to proxy?
  // const from_address = '0x151a712cbf1c3eebf3ca747d165c1988b73348a8'; // from example
  // const from_address = '0x5cab1E5286529370880776461C53A0e47d74FB63'; // address that executed the most recent spell (I think its EOA from makerdao for casting)
  const from_address = MCD_PAUSE;

  // const to_address = '0xad92310c5e1b3622ab6987917d6a074bca428e61'; // spell address from example
  const to_address = MCD_PAUSE_PROXY;
  // const data = '0x2b5e3af16b1880000';
  const data = data2;
  const gas = '0x1c6b9e';
  const gas_price = '0x23bd501f00';
  const execute_on_top_of_block_number = 13624482; // block fromlatest cast
  const timestamp = 1637047755; // 11/15 5:29pm mst

  //0x2b5e3af16b1880000
  //0x02b5e3af16b1880000

  // `http://3.123.40.243/api/v1/transactions/0xf91cdba571422ba3da9e7b79cbc0d51e8208244c2679e4294eec4ab5807acf7f/diffs/decoded`

  const hash = '0xf91cdba571422ba3da9e7b79cbc0d51e8208244c2679e4294eec4ab5807acf7f'; //good hash
  // const hash = '0x21d4d89d0c512bae27c6e3f3c43480ae9fec60478cc3ba6805bb5229b5459a23'; //hash from ysterdays spell
  // const hash = '0x0875eb8fbd80dc06ec296cd7e7411f086487f2fb71a8bfd7dd2c258ebb461a03'; //executive hash (not useful?)
  const diffUrl = `http://3.123.40.243/api/v1/transactions/${hash}/diffs/decoded`;
  // const diffUrl = `http://3.123.40.243/api/v1/transactions/${hash}`;

  // const simulateUrl = `http://3.123.40.243/api/v1/transactions/simulation/?from_address=${from_address}&to_address=${to_address}&data=${data}&gas=${gas}&gas_price=${gas_price}`;
  const simulateUrl = `http://3.123.40.243/api/v1/transactions/simulation/?from_address=${from_address}&to_address=${to_address}&data=${data}&gas=${gas}&gas_price=${gas_price}&execute_on_top_of_block_number=${execute_on_top_of_block_number}&timestamp=${timestamp}`;
  // const simulateUrl =
  //   'http://3.123.40.243/api/v1/transactions/simulation/?from_address=0x151a712cbf1c3eebf3ca747d165c1988b73348a8&to_address=0xad92310c5e1b3622ab6987917d6a074bca428e61&data=0x2b5e3af16b1880000&gas=0x1c6b9e&gas_price=0x23bd501f00';
  const newDiff = [];
  try {
    const newUrl = false;
    // newDiff = await fetchJson(newUrl ? simulateUrl : diffUrl);
  } catch (e) {
    console.error('BAD TIMES', e);
  }

  // console.log('newDiff3', newDiff);

  // const decodedDiff = await fetchJson(ETH_TX_STATE_DIFF_ENDPOINT(SupportedNetworks.MAINNET), {
  //   method: 'POST',
  //   body: JSON.stringify({ trace })
  // });
  // console.log(decodedDiff, 'decodedDiff');

  res.setHeader('Cache-Control', 's-maxage=600, stale-while-revalidate');
  res.status(200).json({ newDiff: newDiff });
  // res.status(200).json({ hasBeenCast, executedOn, decodedDiff });
});
