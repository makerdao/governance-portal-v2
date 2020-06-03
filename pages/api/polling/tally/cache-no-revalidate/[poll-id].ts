import { createPollTallyRoute } from '../[poll-id]';

export default createPollTallyRoute({ cacheType: 'max-age=0, s-maxage=31536000' });
