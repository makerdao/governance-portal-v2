/**
 * Intercept RPC calls to tenderly so that we can increase the gas limit
 */
import { Request, Route } from '@playwright/test';

export const mockRpcCalls = (route: Route, request: Request) => {
  // Check if the request is a POST request and targets the specific endpoint
  if (request.method() === 'POST') {
    // Parse the request body to manipulate it
    const postData = JSON.parse(request.postData() || '{}');

    // Check if the method is eth_sendTransaction or eth_call
    if (
      (postData.method === 'eth_sendTransaction' || postData.method === 'eth_call') &&
      postData.params &&
      postData.params.length > 0
    ) {
      // Add the gas property to the first object in the params array
      postData.params[0].gas = '0x7a1200';

      // Continue the request with the modified postData
      route.continue({
        postData: JSON.stringify(postData)
      });
    } else {
      // If the request does not match the criteria, continue it without modification
      route.continue();
    }
  } else {
    // If the request is not a POST request, continue it without modification
    route.continue();
  }
};
