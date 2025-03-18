/*

SPDX-FileCopyrightText: © 2023 Dai Foundation <www.daifoundation.org>

SPDX-License-Identifier: AGPL-3.0-or-later

*/

import { SupportedNetworks } from 'modules/web3/constants/networks';
import { cacheSet } from 'modules/cache/cache';
import { fetchPollTally } from 'modules/polling/api/fetchPollTally';
import { fetchPollTallyWithSpock } from 'modules/polling/api/spock/fetchPollTallyWithSpock';
import { Poll, PollTally } from 'modules/polling/types';
import { getPollTallyCacheKey } from 'modules/cache/constants/cache-keys';
import { pollHasEnded } from './utils';
import { ONE_WEEK_IN_MS, THIRTY_SECONDS_IN_MS } from 'modules/app/constants/time';

const NEW_POLLING_CALCULATION_START_DATE = new Date('2025-04-01'); //TODO: edit date once we pick a date

export async function getPollTally(poll: Poll, network: SupportedNetworks): Promise<PollTally> {

  const useSpock = poll.startDate < NEW_POLLING_CALCULATION_START_DATE;
  // Builds poll tally
  const tally: PollTally = useSpock ? await fetchPollTallyWithSpock(poll, network) : await fetchPollTally(poll, network);

  const pollEnded = pollHasEnded(poll);

  const cacheKey = getPollTallyCacheKey(poll.pollId);
  cacheSet(cacheKey, JSON.stringify(tally), network, pollEnded ? ONE_WEEK_IN_MS : THIRTY_SECONDS_IN_MS);

  return tally;
}
