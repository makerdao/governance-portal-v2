import { createPollTallyRoute } from '../[poll-id]';

export default createPollTallyRoute({ cacheType: 'max-age=31536000' });
