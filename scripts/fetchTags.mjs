import fetch from 'node-fetch';

import fs from 'fs';

// Fetch and write information from the community repo, during build time, to be used by the gov portal
async function main() {
  try {
    console.log('Downloading tags information from the community repo.');

    // poll-tags mapping
    const urlPollTags =
      'https://raw.githubusercontent.com/makerdao/community/master/governance/polls/meta/poll-tags.json';
    const pollTags = await fetch(urlPollTags);
    const dataPollTags = await pollTags.json();
    fs.writeFileSync(
      './modules/tags/constants/poll-tags-mapping.json',
      JSON.stringify(dataPollTags, null, 2)
    );

    console.log('Downloaded poll-tags mapping.');

    //poll tags
    const urlTags =
      'https://raw.githubusercontent.com/makerdao/community/master/governance/polls/meta/tags.json';
    const tags = await fetch(urlTags);
    const dataTags = await tags.json();
    fs.writeFileSync(
      './modules/tags/constants/poll-tags-definitions.json',
      JSON.stringify(dataTags, null, 2)
    );

    console.log('Downloaded poll tags.');

    //delegate tags
    const urlDelegateTags =
      'https://raw.githubusercontent.com/makerdao/community/master/governance/delegates/meta/tags.json';
    const tagsDelegates = await fetch(urlDelegateTags);
    const dataTagsDelegates = await tagsDelegates.json();
    fs.writeFileSync(
      './modules/tags/constants/delegates-tags-definitions.json',
      JSON.stringify(dataTagsDelegates, null, 2)
    );

    console.log('Downloaded delegate tags.');
  } catch (e) {
    console.error('Error downloading info from the community repo', e.message);
  }
}

main();
