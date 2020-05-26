type Poll = {
  title: string;
  multiHash: string;
  content: string;
  pollId: number;
  summary: string;
  options: { [key: string]: string };
  endDate: string;
  startDate: string;
};

export default Poll;
