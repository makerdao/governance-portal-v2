/*

SPDX-FileCopyrightText: © 2023 Dai Foundation <www.daifoundation.org>

SPDX-License-Identifier: AGPL-3.0-or-later

*/

// Origin of the proxy that serves RPC and indexer traffic. next.config.js fails a production build
// when NEXT_PUBLIC_PROXY_ORIGIN is unset, so the staging default only applies to development builds.
export const PROXY_ORIGIN = process.env.NEXT_PUBLIC_PROXY_ORIGIN || 'https://staging-proxy.sky.money';
