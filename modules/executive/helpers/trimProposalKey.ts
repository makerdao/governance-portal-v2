// Trims the proposal key to a certain length (otherwise build can fail)
export function trimProposalKey(proposalKey: string): string {
    const MAX_SLUG_LENGTH = 200;

    return proposalKey.substring(0, Math.min(proposalKey.length, MAX_SLUG_LENGTH));
}