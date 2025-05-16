import { readFile } from 'fs/promises';
import { TEST_ACCOUNTS } from '../shared';
import { encodeFunctionData, parseUnits } from 'viem';
import { mkrAbi, mkrAddress, chiefAddress, chiefAbi } from '../../modules/contracts/generated';
import { SupportedChainId } from '../../modules/web3/constants/chainID';

export async function depositMkr(amount: string) {
  const file = await readFile('./tenderlyTestnetData.json', 'utf-8');
  const { TENDERLY_RPC_URL } = JSON.parse(file);

  const approvalResponse = await fetch(TENDERLY_RPC_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      jsonrpc: '2.0',
      id: 0,
      method: 'eth_sendTransaction',
      params: [
        {
          from: TEST_ACCOUNTS.normal.address,
          to: mkrAddress[SupportedChainId.TENDERLY],
          gas: '0x7A1200',
          gasPrice: '0x0',
          value: '0x0',
          data: encodeFunctionData({
            abi: mkrAbi,
            functionName: 'approve',
            args: [chiefAddress[SupportedChainId.TENDERLY]]
          })
        }
      ]
    })
  });

  if (!approvalResponse.ok) {
    throw new Error(`Error approving MKR contract: ${approvalResponse.statusText}`);
  }

  const response = await fetch(TENDERLY_RPC_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      jsonrpc: '2.0',
      id: 1,
      method: 'eth_sendTransaction',
      params: [
        {
          from: TEST_ACCOUNTS.normal.address,
          to: chiefAddress[SupportedChainId.TENDERLY],
          gas: '0x7A1200',
          gasPrice: '0x0',
          value: '0x0',
          data: encodeFunctionData({
            abi: chiefAbi,
            functionName: 'lock',
            args: [parseUnits(amount, 18)]
          })
        }
      ]
    })
  });

  if (!response.ok) {
    throw new Error(`Error delegating MKR to test delegate: ${response.statusText}`);
  }

  // Mine a block to confirm the transaction
  const blockMineResponse = await fetch(TENDERLY_RPC_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      jsonrpc: '2.0',
      id: 2,
      method: 'evm_mine',
      params: []
    })
  });

  if (!blockMineResponse.ok) {
    throw new Error(`Error mining block: ${blockMineResponse.statusText}`);
  }

  console.log('Successfully delegated MKR to test delegate');
  return response.ok;
}
