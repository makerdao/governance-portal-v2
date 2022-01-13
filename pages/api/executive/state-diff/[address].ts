import invariant from 'tiny-invariant';
import { NextApiRequest, NextApiResponse } from 'next';
import { ethers } from 'ethers';

import { getTrace } from 'lib/api/utils';
import { ETH_TX_STATE_DIFF_ENDPOINT, SupportedNetworks } from 'modules/web3/web3.constants';
import { fetchJson } from 'lib/fetchJson';
import withApiHandler from 'lib/api/withApiHandler';
import { config } from 'lib/config';
import getMaker from 'lib/maker';

export default withApiHandler(async (req: NextApiRequest, res: NextApiResponse) => {
  const spellAddress: string = req.query.address as string;
  invariant(spellAddress && ethers.utils.isAddress(spellAddress), 'valid spell address required');

  invariant(
    !req.query.network || req.query.network === SupportedNetworks.MAINNET,
    `unsupported network ${req.query.network}`
  );

  const network = SupportedNetworks.MAINNET;
  const maker = await getMaker(network);

  const { MCD_PAUSE, MCD_PAUSE_PROXY } = maker.service('smartContract').getContractAddresses();
  const provider = ethers.getDefaultProvider(network, {
    infura: config.INFURA_KEY,
    alchemy: config.ALCHEMY_KEY
  });

  console.log(config.INFURA_KEY, config.ALCHEMY_KEY, 'infura and alchemy keys state diff');
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
  const [usr] = await ethCall('action');

  let trace;
  let executedOn: number | null = null;

  if (hasBeenCast) {
    const pauseExecSelector = `${ethers.utils
      .id('exec(address,bytes32,bytes,uint256)')
      .slice(0, 10)}${Array.from({ length: 56 })
      .map(() => '0')
      .join('')}`;

    const spellAddressBytes32 = `0x${Array.from({ length: 24 })
      .map(() => '0')
      .join('')}${spellAddress.replace('0x', '')}`;

    const usrBytes32 = `0x${Array.from({ length: 24 })
      .map(() => '0')
      .join('')}${usr.replace('0x', '')}`;

    const [{ transactionHash, blockNumber }] = await new ethers.providers.InfuraProvider(
      network,
      config.INFURA_KEY
    ).getLogs({
      address: MCD_PAUSE,
      fromBlock: 0,
      toBlock: 'latest',
      topics: [pauseExecSelector, spellAddressBytes32, usrBytes32]
    });

    invariant(transactionHash, `Unable to find cast transaction for spell ${spellAddress}`);
    trace = await getTrace('trace_replayTransaction', transactionHash, network);
    executedOn = blockNumber;
  } else {
    trace = await getTrace(
      'trace_call',
      {
        from: MCD_PAUSE,
        to: MCD_PAUSE_PROXY,
        data: encoder.encodeFunctionData('exec', [usr, encoder.encodeFunctionData('actions')])
      },
      network
    );
  }

  console.log(trace, 'trace');
  invariant(trace, `Unable to fetch trace for spell ${spellAddress}`);
  const decodedDiff = await fetchJson(ETH_TX_STATE_DIFF_ENDPOINT(SupportedNetworks.MAINNET), {
    method: 'POST',
    body: JSON.stringify({ trace })
  });
  console.log(decodedDiff, 'decodedDiff');

  res.setHeader('Cache-Control', 's-maxage=600, stale-while-revalidate');
  res.status(200).json({ hasBeenCast, executedOn, decodedDiff });
});
