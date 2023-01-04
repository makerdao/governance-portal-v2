/*

SPDX-FileCopyrightText: © 2023 Dai Foundation <www.daifoundation.org>

SPDX-License-Identifier: AGPL-3.0-or-later

*/

import { useContext } from 'react';
import { AccountContext } from '../context/AccountContext';

export function useAccount() {
  const data = useContext(AccountContext);

  return data;
}
