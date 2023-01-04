/*

SPDX-FileCopyrightText: © 2023 Dai Foundation <www.daifoundation.org>

SPDX-License-Identifier: AGPL-3.0-or-later

*/

/* eslint-disable no-unused-vars */
declare global {
  interface Window {
    ethereum?: any;
    setAccount: (address: string, key: string) => void;
  }
  namespace NodeJS {
    interface Global {
      document: Document;
      window: Window;
      navigator: Navigator;
    }
  }
}
