/*

SPDX-FileCopyrightText: © 2023 Dai Foundation <www.daifoundation.org>

SPDX-License-Identifier: AGPL-3.0-or-later

*/

// List of allowed external domains
const ALLOWED_DOMAINS = ['beaconcha.in', 'etherchain.org', '3.127.236.127'];

export async function fetchJson(url: RequestInfo, init?: RequestInit): Promise<any> {
  // Validate URL if it's a string
  if (typeof url === 'string') {
    // Check if it's an absolute URL (starts with http:// or https://)
    if (url.startsWith('http://') || url.startsWith('https://')) {
      try {
        const parsedUrl = new URL(url);
        if (!ALLOWED_DOMAINS.includes(parsedUrl.hostname)) {
          return Promise.reject({
            status: 403,
            statusText: 'Forbidden',
            message: 'Request to untrusted domain not allowed'
          });
        }
      } catch (error) {
        return Promise.reject({
          status: 400,
          statusText: 'Bad Request',
          message: 'Invalid URL format'
        });
      }
    }
    // For relative URLs, no domain validation is needed as they use the current domain
  }

  const response = await fetch(url, init);
  const json = await response.json();

  if (!response.ok) {
    return Promise.reject({
      status: response.status,
      statusText: response.statusText,
      json,
      message: json?.error && json.error.message ? json.error.message : 'Request failed'
    });
  }
  return json;
}
