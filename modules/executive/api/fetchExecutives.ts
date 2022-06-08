import { config } from 'lib/config';
import { DEFAULT_NETWORK, SupportedNetworks } from 'modules/web3/constants/networks';
import { fsCacheGet, fsCacheSet } from 'lib/fscache';
import { fetchGitHubPage, GithubTokens } from 'lib/github';
import { CMSProposal, Proposal } from 'modules/executive/types';
import { parseExecutive } from './parseExecutive';
import invariant from 'tiny-invariant';
import { markdownToHtml } from 'lib/markdown';
import { EXEC_PROPOSAL_INDEX } from '../executive.constants';
import { analyzeSpell, getExecutiveMKRSupport } from './analyzeSpell';
import { ZERO_ADDRESS } from 'modules/web3/constants/addresses';
import { BigNumber } from 'ethers';

export async function getGithubExecutives(network: SupportedNetworks): Promise<CMSProposal[]> {
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

  const githubResponse = await fetchGitHubPage(owner, repo, path, GithubTokens.Executives);
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
    .sort(a => (a.active ? -1 : 1)) // Sort by active first
    .slice(0, 100);

  if (config.USE_FS_CACHE) {
    fsCacheSet(cacheKey, JSON.stringify(sortedProposals), network);
  }

  return sortedProposals;
}

async function getGithubExecutivesWithMKR(network: SupportedNetworks): Promise<CMSProposal[]> {
  const proposals = await getGithubExecutives(network);

  const mkrSupports = await Promise.all(
    proposals.map(async proposal => {
      const mkrSupport = await getExecutiveMKRSupport(proposal.address, network);
      return {
        ...proposal,
        spellData: {
          mkrSupport
        }
      };
    })
  );

  return mkrSupports;
}

export async function getExecutiveProposals(
  start: number,
  limit: number,
  sortBy: 'date' | 'mkr' | 'active',
  network?: SupportedNetworks,
  startDate = 0,
  endDate = 0
): Promise<Proposal[]> {
  const net = network ? network : DEFAULT_NETWORK.network;

  // Use goerli as a Key for Goerli fork. In order to pick the the current executives
  const currentNetwork = net === SupportedNetworks.GOERLIFORK ? SupportedNetworks.GOERLI : net;

  const cacheKey = `proposals-${start}-${limit}-${sortBy}-${startDate}-${endDate}`;

  if (config.USE_FS_CACHE) {
    const cachedProposals = fsCacheGet(cacheKey, currentNetwork);
    if (cachedProposals) {
      return JSON.parse(cachedProposals);
    }
  }

  const proposals =
    sortBy === 'mkr'
      ? await getGithubExecutivesWithMKR(currentNetwork)
      : await getGithubExecutives(currentNetwork);

  const sorted = proposals.sort((a, b) => {
    if (sortBy === 'mkr') {
      const bSupport = b.spellData ? b.spellData?.mkrSupport || 0 : 0;
      const aSupport = a.spellData ? a.spellData?.mkrSupport || 0 : 0;
      return BigNumber.from(bSupport).gt(BigNumber.from(aSupport)) ? 1 : -1;
    } else if (sortBy === 'date') {
      return new Date(b.date).getTime() - new Date(a.date).getTime();
    } else {
      return a.active ? -1 : 1; // Sort by active first
    }
  });

  // Filter by dates
  const filtered = sorted.filter(proposal => {
    if (startDate && new Date(proposal.date).getTime() < startDate) return false;
    if (endDate && new Date(proposal.date).getTime() > endDate) return false;
    return true;
  });

  const subset = filtered.slice(start, start + limit);

  const analyzedProposals = await Promise.all(
    subset.map(async p => {
      return {
        ...p,
        spellData: await analyzeSpell(p.address, currentNetwork)
      };
    })
  );

  if (config.USE_FS_CACHE) {
    fsCacheSet(cacheKey, JSON.stringify(analyzedProposals), currentNetwork);
  }

  return analyzedProposals;
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
