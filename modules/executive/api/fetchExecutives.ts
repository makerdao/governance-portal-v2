import { config } from 'lib/config';
import { DEFAULT_NETWORK, SupportedNetworks } from 'modules/web3/constants/networks';
import { fsCacheGet, fsCacheSet } from 'lib/fscache';
import { fetchGitHubPage } from 'lib/github';
import { CMSProposal, Proposal, ProposalsAPIResponse } from 'modules/executive/types';
import { parseExecutive } from './parseExecutive';
import invariant from 'tiny-invariant';
import { markdownToHtml } from 'lib/utils';
import { EXEC_PROPOSAL_INDEX } from '../executive.constants';
import { analyzeSpell } from './analyzeSpell';
import { ZERO_ADDRESS } from 'modules/web3/constants/addresses';

async function getGithubExecutives(network: SupportedNetworks): Promise<CMSProposal[]> {
  const cacheKey = 'github-proposals';
  if (config.USE_FS_CACHE) {
    const cachedProposals = fsCacheGet(cacheKey, network);
    if (cachedProposals) {
      return JSON.parse(cachedProposals);
    }
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

        return parseExecutive(proposalDoc, proposalIndex, proposalLink, network);
      } catch (e) {
        console.log(e);
        // Catch error and return null if failed fetching one proposal
        return null;
      }
    })
  );

  const filteredProposals: CMSProposal[] = proposals
    .filter(x => !!x)
    .filter(x => x?.address !== ZERO_ADDRESS) as CMSProposal[];

  const sortedProposals = filteredProposals
    .sort((a, b) => new Date(b.date || '').getTime() - new Date(a.date || '').getTime())
    .slice(0, 100);

  if (config.USE_FS_CACHE) {
    fsCacheSet(cacheKey, JSON.stringify(sortedProposals), network);
  }

  return sortedProposals;
}

export async function getExecutiveProposals(
  start: number,
  limit: number,
  network?: SupportedNetworks
): Promise<ProposalsAPIResponse> {
  const net = network ? network : DEFAULT_NETWORK.network;

  // Use goerli as a Key for Goerli fork. In order to pick the the current executives
  const currentNetwork = net === SupportedNetworks.GOERLIFORK ? SupportedNetworks.GOERLI : net;

  const cacheKey = `proposals-${start}-${limit}`;

  if (config.USE_FS_CACHE) {
    const cachedProposals = fsCacheGet(cacheKey, currentNetwork);
    if (cachedProposals) {
      return JSON.parse(cachedProposals);
    }
  }

  const proposals = await getGithubExecutives(currentNetwork);

  const subset = proposals.slice(start, start + limit);

  const analyzedProposals = await Promise.all(
    subset.map(async p => {
      const spellData = await analyzeSpell(p.address, currentNetwork);
      return {
        ...p,
        spellData
      };
    })
  );

  if (config.USE_FS_CACHE) {
    fsCacheSet(cacheKey, JSON.stringify(analyzedProposals), currentNetwork);
  }

  return {
    total: proposals.length,
    proposals: analyzedProposals
  };
}

export async function getExecutiveProposal(
  proposalId: string,
  network?: SupportedNetworks
): Promise<Proposal | null> {
  const net = network ? network : DEFAULT_NETWORK.network;

  // Use goerli as a Key for Goerli fork. In order to pick the the current executives
  const currentNetwork = net === SupportedNetworks.GOERLIFORK ? SupportedNetworks.GOERLI : net;

  const proposals = await getGithubExecutives(currentNetwork);

  const proposal = proposals.find(proposal => proposal.key === proposalId || proposal.address === proposalId);
  if (!proposal) return null;
  invariant(proposal, `proposal not found for proposal id ${proposalId}`);
  const spellData = await analyzeSpell(proposal.address, currentNetwork);
  const content = await markdownToHtml(proposal.about || '');
  return {
    ...proposal,
    spellData,
    content
  };
}
