/*

SPDX-FileCopyrightText: © 2023 Dai Foundation <www.daifoundation.org>

SPDX-License-Identifier: AGPL-3.0-or-later

*/

import { allSpellVotes } from 'modules/gql/queries/subgraph/allSpellVotes';
import { gqlRequest } from 'modules/gql/gqlRequest';
import { SupportedNetworks } from 'modules/web3/constants/networks';
import { networkNameToChainId } from 'modules/web3/helpers/chain';
import { formatEther } from 'viem';


export async function fetchExecutiveVoteTallyWithSubgraph(network: SupportedNetworks): Promise<Record<string, Array<{address: string, deposits: string, percent: string}>>> {
    const pageSize = 1000;
    let allData: any[] = [];
    let skip = 0;
    let hasMoreData = true;
    
    while (hasMoreData) {
        const response = await gqlRequest({
            chainId: networkNameToChainId(network),
            query: allSpellVotes,
            variables: { argSkip: skip, argFirst: pageSize }
        });
        
        const currentPageData = response.executiveVotesV2 || [];
        allData = [...allData, ...currentPageData];
        
        if (currentPageData.length < pageSize) {
            hasMoreData = false; 
        } else {
            skip += pageSize;
        }
    }
    
    // Find most recent vote(s) for each voter
    const latestVotesByVoter: Record<string, { blockTime: string; votes: any[] }> = {};
    
    for (const vote of allData) {
        const voterId = vote.voter?.id;
        const blockTime = vote.blockTime || '0';
        
        if (!voterId) continue;
        
        if (!latestVotesByVoter[voterId] || blockTime > latestVotesByVoter[voterId].blockTime) {
            // This is a newer vote, replace previous votes
            latestVotesByVoter[voterId] = {
                blockTime,
                votes: [vote]
            };
        } else if (blockTime === latestVotesByVoter[voterId].blockTime) {
            // This is a tied vote (same timestamp), add to list
            latestVotesByVoter[voterId].votes.push(vote);
        }
        // Older votes are ignored
    }
    
    const mostRecentVotes = Object.values(latestVotesByVoter).flatMap(item => item.votes);
    
    //group by spell with voter details
    const formattedData: Record<string, Array<{address: string, deposits: string, percent: string}>> = {};
    
    for (const vote of mostRecentVotes) {
        const spellId = vote.spell?.id;
        const voterId = vote.voter?.id;
        const newBalance = vote.voter?.v2VotingPowerChanges?.[0]?.newBalance || '0';
        
        const formattedDeposit = formatEther(BigInt(newBalance));
        
        if (spellId && voterId && newBalance !== undefined) {
            if (!formattedData[spellId]) {
                formattedData[spellId] = [];
            }
            
            formattedData[spellId].push({
                address: voterId,
                deposits: formattedDeposit,
                percent: '0' // Placeholder, will calculate after all votes are processed
            });
        }
    }
    
    // Calculate percentage for each voter
    for (const spellId in formattedData) {
        const voters = formattedData[spellId];
        
        // Calculate total deposits for this spell using regular numbers
        const totalDeposits = voters.reduce((sum, voter) => {
            return sum + Number(voter.deposits);
        }, 0);
        
        // Add percentage to each voter
        if (totalDeposits > 0) {
            for (const voter of voters) {
                const voterDeposits = Number(voter.deposits);
                // Calculate percentage with 2 decimal places
                voter.percent = ((voterDeposits * 100) / totalDeposits).toFixed(2);
            }
        }
        
        // Sort voters by deposit amount in descending order
        formattedData[spellId].sort((a, b) => {
            return Number(b.deposits) - Number(a.deposits);
        });
        
    }
    return formattedData;
}
