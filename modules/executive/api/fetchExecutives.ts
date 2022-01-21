import { config } from 'lib/config';
import { SupportedNetworks } from 'modules/web3/constants/networks';
import { fsCacheGet, fsCacheSet } from 'lib/fscache';
import { fetchGitHubPage } from 'lib/github';
import { getNetwork, isTestnet } from 'lib/maker';
import { CMSProposal } from 'modules/executive/types';
import mockProposals from './mocks/proposals.json';
import { parseExecutive } from './parseExecutive';
import invariant from 'tiny-invariant';
import { markdownToHtml } from 'lib/utils';
import { EXEC_PROPOSAL_INDEX } from '../executive.constants';

export async function getExecutiveProposals(network?: SupportedNetworks): Promise<CMSProposal[]> {
  const net = network ? network : getNetwork();

  // Use goerli as a Key for Goerli fork. In order to pick the the current executives
  const currentNetwork = net === SupportedNetworks.GOERLIFORK ? SupportedNetworks.GOERLI : net;

  const cacheKey = 'proposals';
  if (config.USE_FS_CACHE) {
    const cachedProposals = fsCacheGet(cacheKey, currentNetwork);
    if (cachedProposals) {
      return JSON.parse(cachedProposals);
    }
  } else if (config.NEXT_PUBLIC_USE_MOCK || isTestnet()) {
    return mockProposals;
  }

  const proposalIndex = await (await fetch(EXEC_PROPOSAL_INDEX)).json();

  const owner = 'makerdao';
  const repo = 'community';
  const path = 'governance/votes';

  const githubResponse = await fetchGitHubPage(owner, repo, path);
  const proposalUrls = githubResponse
    .filter(x => x.type === 'file')
    .map(x => x.download_url)
    .filter(x => !!x);

  const proposals = await Promise.all(
    proposalUrls.map(async (proposalLink): Promise<CMSProposal | null> => {
      try {
        const proposalDoc = await (await fetch(proposalLink)).text();

        return parseExecutive(proposalDoc, proposalIndex, proposalLink, currentNetwork);
      } catch (e) {
        console.log(e);
        // Catch error and return null if failed fetching one proposal
        return null;
      }
    })
  );

  const filteredProposals: CMSProposal[] = proposals.filter(x => !!x) as CMSProposal[];

  const sortedProposals = filteredProposals
    .sort((a, b) => new Date(b.date || '').getTime() - new Date(a.date || '').getTime())
    .slice(0, 100);

  if (config.USE_FS_CACHE) {
    fsCacheSet(cacheKey, JSON.stringify(sortedProposals), currentNetwork);
  }
  return sortedProposals;
}

export async function getExecutiveProposal(
  proposalId: string,
  network?: SupportedNetworks
): Promise<CMSProposal | null> {
  const proposals = await getExecutiveProposals(network);
  const proposal = proposals.find(proposal => proposal.key === proposalId);
  if (!proposal) return null;
  invariant(proposal, `proposal not found for proposal id ${proposalId}`);
  const content = await markdownToHtml(proposal.about || '');
  return {
    ...proposal,
    content
  };
}
