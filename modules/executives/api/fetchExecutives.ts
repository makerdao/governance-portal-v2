import { config } from 'lib/config';
import { EXEC_PROPOSAL_INDEX } from 'lib/constants';
import { fsCacheGet, fsCacheSet } from 'lib/fscache';
import { fetchGitHubPage } from 'lib/github';
import { isTestnet } from 'lib/maker';
import { CMSProposal } from 'types/proposal';
import mockProposals from './mocks/proposals.json';
import { parseExecutive } from './parseExecutive';
import invariant from 'tiny-invariant';
import { markdownToHtml } from 'lib/utils';

export async function getExecutiveProposals(): Promise<CMSProposal[]> {
    if (config.USE_FS_CACHE) {
      const cachedProposals = fsCacheGet('proposals');
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
      proposalUrls.map(
        async (proposalLink): Promise<CMSProposal | null> => {
          try {
            const proposalDoc = await (await fetch(proposalLink)).text();
  
            return parseExecutive(proposalDoc, proposalIndex, proposalLink);
          } catch (e) {
            // Catch error and return null if failed fetching one proposal
            return null;
          }
        }
      )
    );
  
    const filteredProposals: CMSProposal[] = proposals.filter(x => !!x) as CMSProposal[];
  
    const sortedProposals = filteredProposals
      .sort((a, b) => new Date(b.date || '').getTime() - new Date(a.date || '').getTime())
      .slice(0, 100);
  
    if (process.env.USE_FS_CACHE) fsCacheSet('proposals', JSON.stringify(sortedProposals));
    return sortedProposals;
  }
  
  export async function getExecutiveProposal(proposalId: string): Promise<CMSProposal | null> {
    const proposals = await getExecutiveProposals();
    const proposal = proposals.find(proposal => proposal.key === proposalId);
    if (!proposal) return null;
    invariant(proposal, `proposal not found for proposal id ${proposalId}`);
    const content = await markdownToHtml(proposal.about || '');
    return {
      ...proposal,
      content
    };
  }