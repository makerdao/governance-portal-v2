// All votes in spock are stored this way
export type SpockVote = { optionIdRaw: number; mkrSupport: number };

// We normalize the spock vote parsing the optionIdRaw into a ballot. In single choice votes the ballot is an array of 1 item. 
export type ParsedSpockVote = { optionIdRaw: string|number; mkrSupport: number|string;  ballot: number[] };