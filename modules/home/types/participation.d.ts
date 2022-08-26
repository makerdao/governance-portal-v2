export type AllLocksResponse = {
  fromAddress: string;
  immediateCaller: string;
  lockAmount: string;
  blockNumber: string;
  blockTimestamp: string;
  lockTotal: string;
  unixDate: number;
  total: string;
  month: string;
};

export type ForumPost = {
  title: string;
  summary: string;
  link: string;
  image: string;
};
