export const isValidPollIdParam = (pollIdParam: string): Boolean => {
  const pollId = parseInt(pollIdParam, 10);

  // here we could see if this poll id exists in poll-tags-mapping
  // or some other way to validate the actual number
  // but for now just throws error if it's not a valid number
  return !isNaN(pollId);
};
