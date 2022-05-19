export async function fetchMappedPollTags(): Promise<{ [key: number]: string[] }> {
  try {
    // const url =  'https://raw.githubusercontent.com/makerdao/community/master/governance/polls/meta/categories.json';
    // const resp = await fetch(url);
    // return resp.json();

    return {
      1: ['risk']
    };
  } catch (err) {
    console.error('Error fetching poll tags mapping', e.message);
    return {};
  }
}
