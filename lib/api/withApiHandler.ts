export default function withApiHandler(handler, { allowPost = false } = {}) {
  return async (req, res) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', allowPost ? 'GET, POST' : 'GET');
    res.setHeader('Access-Control-Allow-Headers', 'Authorization, Accept, Content-Type');

    if (req.method === 'OPTIONS') {
      return res.status(200).json({});
    }

    if (req.method !== 'GET' && (!allowPost || req.method !== 'POST')) {
      return res.status(405).json({
        error: {
          code: 'method_not_allowed',
          message: 'Only GET requests are supported for this endpoint.'
        }
      });
    }

    try {
      const result = await handler(req, res);
      return result;
    } catch (error) {
      console.log('server error', error);
      return res.status(500).json({
        error: {
          code: 'unexpected_error',
          message: 'An unexpected error occurred.'
        }
      });
    }
  };
}
